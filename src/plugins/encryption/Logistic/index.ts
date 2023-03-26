import { PixelBuffer } from "@/service/image/type";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;
type decryptFuncType = encryptFuncType;

const encrypt: encryptFuncType = async (
  { buffer, width, height, name },
  key
) => {
  const { string2HashNumber } = await import("@/utils/string");
  // 初始化
  const pixels = new Uint8ClampedArray(buffer);
  const midPixels = new Uint8ClampedArray(pixels.length);
  const mu = 3.999999999999999; //不超过15位小数确保精度
  let state = string2HashNumber(key, true);
  let stateR = string2HashNumber(`Red-${key}-Red`, true);
  let stateG = string2HashNumber(`Green-${key}-Green`, true);
  let stateB = string2HashNumber(`Blue-${key}-Blue`, true);
  //使用混沌序列对图像进行加密
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const index = (i * width + j) * 4;
      // 对像素进行异或, 不同的state迭代次数和不同通道的状态可以极大程度的去除图像中的特征

      // 图像R值
      state = mu * state * (1 - state);
      stateR = mu * stateR * (1 - stateR);
      midPixels[index] =
        pixels[index] ^ Math.round(state * 255) ^ Math.round(stateR * 255);

      // 图像G值
      state = mu * state * (1 - state);
      stateG = mu * stateG * (1 - stateG);
      midPixels[index + 1] =
        pixels[index + 1] ^ Math.round(state * 255) ^ Math.round(stateG * 255);

      // 图像B值
      state = mu * state * (1 - state);
      stateB = mu * stateB * (1 - stateB);
      midPixels[index + 2] =
        pixels[index + 2] ^ Math.round(state * 255) ^ Math.round(stateB * 255);

      // 图像A值保持不变
      midPixels[index + 3] = pixels[index + 3];
    }
  }
  // 4. 输出
  return {
    name,
    buffer: midPixels.buffer,
    width,
    height,
  };
};

const decrypt: decryptFuncType = async (data, key) => {
  const { encrypt } = await import("./index");
  // 解密与加密过程相同
  return encrypt(data, key);
};

export { encrypt, decrypt };
