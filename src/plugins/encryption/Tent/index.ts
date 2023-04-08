import { PixelBuffer } from "@/service/image/type";
import { PBKDF2 } from "crypto-js";
import { str2Num } from "@/utils/string";
type encryptFuncType = (
  data: PixelBuffer,
  key: string
) => {
  data: PixelBuffer;
};
type decryptFuncType = encryptFuncType;

const encrypt: encryptFuncType = ({ buffer, width, height, name }, key) => {
  // 初始化
  const pixels = new Uint8ClampedArray(buffer);
  const midPixels = new Uint8ClampedArray(pixels.length);
  // Tent映射函数
  const tentMap = (x: number) => {
    const r = 1.999999999999999;
    if (x < 0.5) {
      x = r * x;
    } else {
      x = r * (1 - x);
    }
    return x;
  };

  //派生密钥
  const keys = Array.from({ length: 4 }, (_, i) =>
    PBKDF2(key, `key${i}`).toString()
  );

  //将密钥转换为初始状态
  let states = keys.map((key) => str2Num(key, true));
  //初始迭代1000次
  for (let i = 0; i < 1000; i++) {
    states = states.map(tentMap);
  }

  //使用混沌序列对图像进行加密
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const index = (i * width + j) * 4;
      // 对像素进行异或, 不同的state迭代次数和不同通道的状态可以极大程度的去除图像三个通道的相关性
      states = states.map(tentMap);
      // 图像R值
      states[0] = tentMap(states[0]);
      midPixels[index] =
        pixels[index] ^
        Math.round(states[0] * 255) ^
        Math.round(states[1] * 255);

      // 图像G值
      states[0] = tentMap(states[0]);
      midPixels[index + 1] =
        pixels[index + 1] ^
        Math.round(states[0] * 255) ^
        Math.round(states[2] * 255);

      // 图像B值
      states[0] = tentMap(states[0]);
      midPixels[index + 2] =
        pixels[index + 2] ^
        Math.round(states[0] * 255) ^
        Math.round(states[3] * 255);

      // 图像A值保持不变
      midPixels[index + 3] = pixels[index + 3];
    }
  }
  // 输出
  return {
    data: {
      name,
      buffer: midPixels.buffer,
      width,
      height,
    },
  };
};

const decrypt: decryptFuncType = (data, key) => {
  // 解密与加密过程相同
  return encrypt(data, key);
};

export { encrypt, decrypt };
