import { PixelBuffer } from "@/service/image/type";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;

const encrypt: encryptFuncType = async (data, key) => {
  const { mat2, vec2 } = await import("gl-matrix");
  const { padImageToSquare } = await import("@/utils/file");
  // 将图像填充为正方形
  const paddedData = padImageToSquare(data);
  // 初始化原始和变换后的 Uint8ClampedArray
  const originalData = new Uint8ClampedArray(paddedData.buffer);
  const transformedData = new Uint8ClampedArray(originalData.length);
  //定义Arnold变换矩阵
  const arnoldMatrix = mat2.fromValues(1, 1, 1, 2);
  const { width, height, name } = paddedData;
  //循环处理像素
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const newPosition = vec2.create();
      let newX = x;
      let newY = y;
      for (let k = 0; k < Number(key); k++) {
        vec2.transformMat2(
          newPosition,
          vec2.fromValues(newX, newY),
          arnoldMatrix
        );
        newX = (newPosition[0] + width) % width;
        newY = (newPosition[1] + height) % height;
      }
      const newIndex = (newY * width + newX) * 4;
      const oldIndex = (y * width + x) * 4;

      transformedData.set(
        originalData.subarray(oldIndex, oldIndex + 4),
        newIndex
      );
    }
  }

  // 返回输出数据
  return {
    buffer: transformedData.buffer,
    width,
    height,
    name,
  };
};
const decrypt = async (data: PixelBuffer, key: string) => {
  const { restoreImageFromSquare } = await import("@/utils/file");
  const { mat2, vec2 } = await import("gl-matrix");
  const { padImageToSquare } = await import("@/utils/file");
  // 将图像填充为正方形
  const paddedData = padImageToSquare(data);
  // 初始化原始和变换后的 Uint8ClampedArray
  const originalData = new Uint8ClampedArray(paddedData.buffer);
  const transformedData = new Uint8ClampedArray(originalData.length);
  //定义Arnold变换矩阵
  const arnoldMatrix = mat2.fromValues(2, -1, -1, 1);
  const { width, height, name } = paddedData;
  //循环处理像素

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const newPosition = vec2.create();
      let newX = x;
      let newY = y;
      for (let k = 0; k < Number(key); k++) {
        vec2.transformMat2(
          newPosition,
          vec2.fromValues(newX, newY),
          arnoldMatrix
        );
        newX = (newPosition[0] + width) % width;
        newY = (newPosition[1] + height) % height;
      }
      const newIndex = (newY * width + newX) * 4;
      const oldIndex = (y * width + x) * 4;

      transformedData.set(
        originalData.subarray(oldIndex, oldIndex + 4),
        newIndex
      );
    }
  }
  // 返回输出数据
  return {
    buffer: transformedData.buffer,
    width,
    height,
    name,
  };
};

export { encrypt, decrypt };
