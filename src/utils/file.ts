import { PixelBuffer } from "@/service/image/type";
import SparkMD5 from "spark-md5";
import { getNewFileName } from "./string";
import Pica from "pica";
import { FileType } from "@/components/Upload/type";
import produce from "immer";

/**
 * 计算文件的 MD5 值
 * @param file 文件对象
 * @param onProgress 计算进度回调函数
 * @returns Promise<string> MD5 值
 */
export function calculateMD5(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileSize = file.size;
  const chunkSize = 1024 * 1024 * 10; // 每片 10MB

  if (fileSize <= chunkSize) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const spark = new SparkMD5.ArrayBuffer();
        spark.append(e.target?.result as ArrayBuffer);
        const md5 = spark.end();
        resolve(md5);
      };
    });
  }

  return new Promise<string>((resolve) => {
    const chunks = Math.ceil(fileSize / chunkSize);
    let currentChunk = 0;
    let currentPosition = 0;
    const spark = new SparkMD5.ArrayBuffer();

    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      spark.append(e.target?.result as ArrayBuffer);

      currentPosition += chunkSize;
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        const md5 = spark.end();
        resolve(md5);
      }

      if (onProgress) {
        const progress = Math.min((currentPosition / fileSize) * 100, 100);
        onProgress(progress);
      }
    };

    function loadNext() {
      const start = currentPosition;
      const end = Math.min(start + chunkSize, fileSize);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}
/**
 *
 * @param file 任意格式的图像文件
 * @param quality 图像压缩质量，取值范围为0-1，默认不压缩
 * @returns 图像文件的ArrayBuffer像素数据
 */
export async function file2PixelsBuffer(
  file: File,
  quality = 1
): Promise<PixelBuffer> {
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  ctx.drawImage(img, 0, 0);
  //压缩图片
  if (quality < 1) {
    const blob = await (canvas as any).convertToBlob({
      type: "image/jpeg",
      quality,
    });
    const lossyImage = await createImageBitmap(blob);
    //清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(lossyImage, 0, 0);
  }
  const pixelData = ctx.getImageData(0, 0, img.width, img.height).data.buffer;
  return {
    name: file.name,
    buffer: pixelData,
    width: img.width,
    height: img.height,
  };
}
/**
 *
 * @param pixels 图像像素数据
 * @param type 要生成图片的类型
 * @returns 图像文件
 */
export async function pixelsBuffer2File(
  pixelBuffer: PixelBuffer,
  type = "image/png",
  quality = 1
): Promise<File> {
  const { buffer, width, height, name } = pixelBuffer;
  const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const ctx = offscreenCanvas.getContext(
    "2d"
  ) as OffscreenCanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);
  //type对于所有格式并非全部有效，依据浏览器支持情况而定
  const blob = await (offscreenCanvas as any).convertToBlob({
    type,
    quality,
  });
  //处理文件名
  const newName = getNewFileName(name, blob.type);
  return new File([blob], `encrypted-${newName}`, { type: blob.type });
}
/**
 *
 * @param file File格式图像文件
 * @returns Image图像对象
 */
export const file2Image = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
  });
};
/**
 * @param origin File格式图像文件
 * @param current File格式图像文件
 * @returns 压缩率
 */
export const getCompressionRate = (origin: File, current: File) => {
  return Math.round((current.size / origin.size) * 10000) / 100;
};

/**
 * 将长方形图像填充为正方形，采用尾部填充的方式。
 * @param data 要填充的像素数据
 * @returns 填充后的像素数据
 */
export const padImageToSquare = (data: PixelBuffer): PixelBuffer => {
  const { width, height, buffer, name } = data;
  const maxDim = Math.max(width, height);
  if (width === height) {
    // 已经是正方形，无需填充
    return data;
  } else if (width > height) {
    // 宽度大于高度，向下填充
    const paddedBuffer = new Uint8ClampedArray(maxDim ** 2 * 4);
    paddedBuffer.set(new Uint8ClampedArray(buffer));
    return {
      name,
      width: maxDim,
      height: maxDim,
      buffer: paddedBuffer.buffer,
    };
  } else {
    // 高度大于宽度，向右填充
    const paddedBuffer = new Uint8ClampedArray(maxDim ** 2 * 4);
    const rowSize = width * 4;
    for (let i = 0; i < height; i++) {
      const offset = i * rowSize;
      paddedBuffer.set(
        new Uint8ClampedArray(buffer, offset, rowSize),
        offset + i * (maxDim - width) * 4
      );
    }
    return {
      name,
      width: maxDim,
      height: maxDim,
      buffer: paddedBuffer.buffer,
    };
  }
};
/**
 * 将正方形图像还原为长方形，去除尾部填充的部分。
 * @param data 要还原的像素数据
 * @returns 还原后的像素数据
 */
export const restoreImageFromSquare = (data: PixelBuffer): PixelBuffer => {
  const { width, height, buffer, name } = data;
  if (width !== height) {
    // 不是正方形，无需还原
    return data;
  }

  //从最后一行倒序遍历，若该行55%为零，则认为该行为填充行
  let paddingBottom = 0;
  let paddingRight = 0;
  for (let i = height - 1; i >= 0; i--) {
    const rowSize = width * 4;
    const offset = i * rowSize;
    const row = new Uint8ClampedArray(buffer, offset, rowSize);
    let blockLength = 0;
    let alphaLength = 0;
    row.forEach((pixels, index) => {
      if (pixels < 30) {
        if (index % 3 !== 0) {
          blockLength++;
        } else {
          alphaLength++;
        }
      }
    });
    if (
      (alphaLength * 4) / row.length > 0.55 ||
      (blockLength * 4) / (row.length * 3) > 0.55
    ) {
      paddingBottom++;
    } else {
      break;
    }
  }
  if (paddingBottom > 0) {
    //去除填充行
    const newheight = height - paddingBottom;
    const restoredBuffer = new Uint8ClampedArray(newheight * width * 4);
    restoredBuffer.set(new Uint8ClampedArray(buffer, 0, newheight * width * 4));
    return {
      name,
      width,
      height: newheight,
      buffer: restoredBuffer.buffer,
    };
  }
  //从右侧开始，若该列55%为零，则认为该列为填充列
  for (let i = width - 1; i >= 0; i--) {
    const column = new Uint8ClampedArray(height * 4);
    for (let j = 0; j < height; j++) {
      column.set(
        new Uint8ClampedArray(buffer, j * width * 4 + i * 4, 4),
        j * 4
      );
    }
    let blockLength = 0;
    let alphaLength = 0;
    column.forEach((pixels, index) => {
      if (pixels < 30) {
        if (index % 3 !== 0) {
          blockLength++;
        } else {
          alphaLength++;
        }
      }
    });
    if (
      (alphaLength * 4) / column.length > 0.55 ||
      (blockLength * 4) / (column.length * 3) > 0.55
    ) {
      paddingRight++;
    } else {
      break;
    }
  }
  //去除填充列
  const restoredBuffer = new Uint8ClampedArray(
    height * (width - paddingRight) * 4
  );
  for (let i = 0; i < height; i++) {
    restoredBuffer.set(
      new Uint8ClampedArray(buffer, i * width * 4, (width - paddingRight) * 4),
      i * (width - paddingRight) * 4
    );
  }
  return {
    name,
    width: width - paddingRight,
    height,
    buffer: restoredBuffer.buffer,
  };
};
/**
 * 获取图像缩略图
 * @param file 图像文件
 * @param targetWidth 目标宽度
 * @param targetHeight 目标高度
 * @param isWorker 是否在web worker中运行
 * @returns 缩略图文件
 */
export const getThumbnail = async (
  file: File,
  targetWidth: number,
  targetHeight: number,
  isWorker?: boolean
): Promise<File> => {
  try {
    const pica = new Pica({
      createCanvas: (width, height) =>
        new OffscreenCanvas(width, height) as any,
    });
    //将文件转换为图像数据, web worker不能访问Image, 但是file2Image效率更快一点
    const imageData = isWorker
      ? await createImageBitmap(file)
      : await file2Image(file);
    //计算缩放比例
    const scale = Math.min(
      targetWidth / imageData.width,
      targetHeight / imageData.height
    );
    //设置缩略图大小
    const destCanvas = new OffscreenCanvas(
      imageData.width * scale,
      imageData.height * scale
    );
    //生成缩略图
    await pica.resize(imageData, destCanvas as any);
    //const resizedBlob = await pica.toBlob(result, "image/png"); //火狐浏览器会阻止OffscreenCanvas的toBlob方法
    const resizedBlob = await (destCanvas as any).convertToBlob({
      type: "image/png",
    });
    //返回缩略图文件
    return new File([resizedBlob], file.name, {
      type: resizedBlob.type,
    });
  } catch (error) {
    console.error("生成缩略图失败: ", error);
    return file;
  }
};
/**
 *
 * @param file 文件
 * @param fileMd5 文件md5
 * @param isCreateURL 是否创建url
 * @param thumbnailWidth 缩略图宽度
 * @param thumbnailHeight 缩略图高度
 * @returns Promise<FileType> 复合类型文件
 */
export const file2FileType = async (
  file: File,
  fileMd5?: string | null | false,
  isCreateURL = true,
  isWorker = false,
  thumbnailWidth = 128,
  thumbnailHeight = 128
): Promise<FileType> => {
  //获取缩略图
  const thumFile = await getThumbnail(
    file,
    thumbnailWidth,
    thumbnailHeight,
    isWorker
  );
  //计算文件md5
  const md5 = fileMd5 || (await calculateMD5(file));
  //计算图像的src
  const src = isCreateURL ? URL.createObjectURL(file) : "";
  const thumSrc = isCreateURL ? URL.createObjectURL(thumFile) : "";
  //构建缩略图对象
  const thumbnail = {
    file: thumFile,
    src: thumSrc,
  };
  return {
    file,
    src,
    md5,
    thumbnail,
  };
};
/**
 * 为FileType对象创建URL
 * @param fileType 可能未携带src或者src为空的FileType对象
 * @returns 带有完整src的FileType对象
 */
export const createURL4FileType = (fileType: FileType): FileType => {
  return produce<FileType>((draft) => {
    if (!draft.src) {
      draft.src = URL.createObjectURL(draft.file);
    }
    if (!draft.thumbnail.src) {
      draft.thumbnail.src = URL.createObjectURL(draft.thumbnail.file);
    }
  })(fileType);
};
