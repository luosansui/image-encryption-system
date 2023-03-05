import { PixelBuffer } from "@/service/image/type";
import SparkMD5 from "spark-md5";

export type ProgressCallback = (progress: number) => void;

/**
 * 计算文件的 MD5 值
 * @param file 文件对象
 * @param onProgress 计算进度回调函数
 * @returns Promise<string> MD5 值
 */
export function calculateMD5(
  file: File,
  onProgress?: ProgressCallback
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
  type: string
): Promise<File> {
  const { buffer, width, height, name } = pixelBuffer;
  const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const ctx = offscreenCanvas.getContext(
    "2d"
  ) as OffscreenCanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);
  const blob = await (offscreenCanvas as any).convertToBlob({
    type,
    quality: 1,
  });
  return new File([blob], name, { type: blob.type });
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
