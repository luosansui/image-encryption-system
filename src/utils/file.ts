import { PixelBuffer } from "@/service/image/type";
import SparkMD5 from "spark-md5";
import { getNewFileName } from "./string";

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
 * @returns 图像文件的ArrayBuffer像素数据
 */
export async function file2PixelsBuffer(file: File): Promise<PixelBuffer> {
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
  ctx.drawImage(img, 0, 0);
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
  type: string,
  quality = 1
): Promise<File> {
  const { buffer, width, height, name } = pixelBuffer;
  const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const ctx = offscreenCanvas.getContext(
    "2d"
  ) as OffscreenCanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);
  //TODO: 这里type无效
  const blob = await (offscreenCanvas as any).convertToBlob({
    type,
    quality,
  });
  //处理文件名
  const newName = getNewFileName(name, type);
  return new File([blob], `new-${newName}`, { type: blob.type });
}
/**
 *
 * @param file File格式图像文件
 * @returns Image图像对象
 */
export const file2Image = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target?.result as string;
      image.onload = () => {
        resolve(image);
      };
      image.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
/**
 * @param origin File格式图像文件
 * @param current File格式图像文件
 * @returns 压缩率
 */
export const getCompressionRate = (origin: File, current: File) => {
  return `${Math.round((current.size / origin.size) * 10000) / 100} %`;
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
    const paddedBuffer = new Uint8Array(maxDim ** 2 * 4);
    paddedBuffer.set(new Uint8Array(buffer));
    return {
      name,
      width: maxDim,
      height: maxDim,
      buffer: paddedBuffer.buffer,
    };
  } else {
    // 高度大于宽度，向右填充
    const paddedBuffer = new Uint8Array(maxDim ** 2 * 4);
    const rowSize = width * 4;
    for (let i = 0; i < height; i++) {
      const offset = i * rowSize;
      paddedBuffer.set(
        new Uint8Array(buffer, offset, rowSize),
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

将正方形图像还原为长方形，去除尾部填充的部分。
@param data 要还原的像素数据
@returns 还原后的像素数据
*/
export const restoreImageFromSquare = (data: PixelBuffer): PixelBuffer => {
  const { width, height, buffer, name } = data;
  if (width === height) {
    // 已经是正方形，无需还原
    return data;
  } else if (width > height) {
    // 宽度大于高度，从下面截取
    const croppedBuffer = buffer.slice(0, height * width * 4);
    return {
      name,
      width: width,
      height: height,
      buffer: croppedBuffer,
    };
  } else {
    // 高度大于宽度，从右边截取
    const rowSize = width * 4;
    const croppedBuffer = new ArrayBuffer(height * rowSize);
    const croppedRows = new Uint8Array(croppedBuffer);
    for (let i = 0; i < height; i++) {
      const offset = i * rowSize;
      croppedRows.set(new Uint8Array(buffer, offset, rowSize), offset);
    }
    return {
      name,
      width: width,
      height: height,
      buffer: croppedBuffer,
    };
  }
};
