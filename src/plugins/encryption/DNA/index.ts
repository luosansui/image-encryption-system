import { PixelBuffer } from "@/service/image/type";
import { DNAByte } from "@/utils/dna";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;
type decryptFuncType = encryptFuncType;
type DNAByte3Channel = [DNAByte, DNAByte, DNAByte];
/**
 * 默认规则编码->在默认规则编码的前提下用某种方式和前一个像素计算->动态规则解码
 * @param data 图像数据
 * @param key 密钥
 * @returns 加密后的图像数据
 */
const encrypt: encryptFuncType = async (
  { buffer, width, height, name },
  key
) => {
  const { PBKDF2 } = await import("crypto-js");
  const { str2Num } = await import("@/utils/string");
  const { dnaByte2Byte, byte2DNAByte, add4Rule1, sub4Rule1, xor4Rule1 } =
    await import("@/utils/dna");
  // 初始化
  const pixels = new Uint8ClampedArray(buffer);
  const midPixels = new Uint8ClampedArray(pixels.length);

  //规则对应操作
  const funcMap = {
    0: add4Rule1,
    1: xor4Rule1,
    2: sub4Rule1,
  };
  // logistic映射函数
  const logistic = (x: number) => {
    const mu = 3.999999999999999;
    return mu * x * (1 - x);
  };

  //派生密钥
  //keys[0-2]用于确定不同通道动态规则
  //keys[3]用于确定运算规则
  const keys = Array.from({ length: 4 }, (_, i) =>
    PBKDF2(key, `key${i}`).toString()
  );
  //额外的密钥用于确定初始状态
  //用于确定默认规则和扩散初始值
  const extraKeys = Array.from({ length: 3 }, (_, i) =>
    PBKDF2(key, `extraKey${i}`).toString()
  );
  //将密钥转换为初始状态
  let states = keys.map((key) => str2Num(key, true));
  //将额外密钥转换为初始状态
  let extraStates = extraKeys.map((key) => str2Num(key, true));
  //初始迭代1000次
  for (let i = 0; i < 1000; i++) {
    states = states.map(logistic);
    extraStates = extraStates.map(logistic);
  }
  //确定默认规则
  const defaultRule = Math.round(extraStates[0] * 7);
  //确定扩散初始值
  const prevDNAByte3Channel: DNAByte3Channel = [
    byte2DNAByte(
      Math.round(extraStates[2] * 255),
      Math.round(extraStates[0] * 7)
    ),
    byte2DNAByte(
      Math.round(extraStates[1] * 255),
      Math.round(extraStates[1] * 7)
    ),
    byte2DNAByte(
      Math.round(extraStates[0] * 255),
      Math.round(extraStates[2] * 7)
    ),
  ];
  //使用混沌序列对图像进行加密
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      const index = (h * width + w) * 4;
      //迭代混沌序列
      states = states.map(logistic);

      // 使用默认编码规则编码三个通道
      const currDNAByte3Channel: DNAByte3Channel = [
        byte2DNAByte(pixels[index], defaultRule),
        byte2DNAByte(pixels[index + 1], defaultRule),
        byte2DNAByte(pixels[index + 2], defaultRule),
      ];

      //根据key[1]确定运算规则, 逐通道运算
      const ruleFunc = funcMap[Math.round(states[3] * 2) as 0 | 1 | 2];
      for (let i = 0; i < prevDNAByte3Channel.length; i++) {
        const prevDNAByte = prevDNAByte3Channel[i];
        const currDNAByte = currDNAByte3Channel[i];
        // 每个像素包含4个编码
        currDNAByte3Channel[i] = prevDNAByte.map((prevDNACode, codeIndex) =>
          ruleFunc(currDNAByte[codeIndex], prevDNACode)
        ) as DNAByte;

        // 记录当前通道编码
        prevDNAByte3Channel[i] = currDNAByte3Channel[i];
      }

      // 根据key[0]使用动态解码规则解码三个通道
      midPixels[index] = dnaByte2Byte(
        currDNAByte3Channel[0],
        Math.round(states[0] * 7)
      );
      midPixels[index + 1] = dnaByte2Byte(
        currDNAByte3Channel[1],
        Math.round(states[1] * 7)
      );
      midPixels[index + 2] = dnaByte2Byte(
        currDNAByte3Channel[2],
        Math.round(states[2] * 7)
      );
      // 图像A值保持不变
      midPixels[index + 3] = pixels[index + 3];
    }
  }
  // 输出
  return {
    name,
    buffer: midPixels.buffer,
    width,
    height,
  };
};
/**
 * 动态规则解码->得到计算后的结果, 将结果和前一个的加密结果做反运算->默认规则解码
 * @param data 图像数据
 * @param key 密钥
 * @returns 解密后的图像数据
 */

const decrypt: decryptFuncType = async (
  { buffer, width, height, name },
  key
) => {
  const { PBKDF2 } = await import("crypto-js");
  const { str2Num } = await import("@/utils/string");
  const { dnaByte2Byte, byte2DNAByte, add4Rule1, sub4Rule1, xor4Rule1 } =
    await import("@/utils/dna");
  // 初始化
  const pixels = new Uint8ClampedArray(buffer);
  const midPixels = new Uint8ClampedArray(pixels.length);
  //规则对应操作
  const funcMap = {
    0: add4Rule1,
    1: xor4Rule1,
    2: sub4Rule1,
  };
  // logistic映射函数
  const logistic = (x: number) => {
    const mu = 3.999999999999999;
    return mu * x * (1 - x);
  };

  //派生密钥
  //keys[0-2]用于确定动态规则
  //keys[3]用于确定运算规则
  const keys = Array.from({ length: 4 }, (_, i) =>
    PBKDF2(key, `key${i}`).toString()
  );
  //额外的密钥用于确定初始状态
  //用于确定默认规则和扩散初始值
  const extraKeys = Array.from({ length: 3 }, (_, i) =>
    PBKDF2(key, `extraKey${i}`).toString()
  );
  //将密钥转换为初始状态
  let states = keys.map((key) => str2Num(key, true));
  //将额外密钥转换为初始状态
  let extraStates = extraKeys.map((key) => str2Num(key, true));
  //初始迭代1000次
  for (let i = 0; i < 1000; i++) {
    states = states.map(logistic);
    extraStates = extraStates.map(logistic);
  }
  //确定默认规则
  const defaultRule = Math.round(extraStates[0] * 7);
  //确定扩散初始值
  const prevDNAByte3Channel: DNAByte3Channel = [
    byte2DNAByte(
      Math.round(extraStates[2] * 255),
      Math.round(extraStates[0] * 7)
    ),
    byte2DNAByte(
      Math.round(extraStates[1] * 255),
      Math.round(extraStates[1] * 7)
    ),
    byte2DNAByte(
      Math.round(extraStates[0] * 255),
      Math.round(extraStates[2] * 7)
    ),
  ];
  //使用混沌序列对图像进行解密
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      const index = (h * width + w) * 4;
      //迭代混沌序列
      states = states.map(logistic);

      // 根据key[0]使用动态编码规则编码三个通道，还原到计算后的状态
      const currDNAByte3Channel: DNAByte3Channel = [
        byte2DNAByte(pixels[index], Math.round(states[0] * 7)),
        byte2DNAByte(pixels[index + 1], Math.round(states[1] * 7)),
        byte2DNAByte(pixels[index + 2], Math.round(states[2] * 7)),
      ];

      //根据key[1]确定运算规则, 逐通道逆运算
      const ruleFunc = funcMap[(2 - Math.round(states[3] * 2)) as 0 | 1 | 2];
      for (let i = 0; i < prevDNAByte3Channel.length; i++) {
        const prevDNAByte = prevDNAByte3Channel[i];
        const currDNAByte = currDNAByte3Channel[i];
        // 每个像素包含4个编码
        // 因为当前像素加密时使用的值是前一个像素加密后的值，所以为了后面的像素解密, 这里也应该是当前像素的加密值
        prevDNAByte3Channel[i] = currDNAByte3Channel[i];
        // 运算解密像素
        currDNAByte3Channel[i] = prevDNAByte.map((prevDNACode, codeIndex) =>
          ruleFunc(currDNAByte[codeIndex], prevDNACode)
        ) as DNAByte;
      }
      // 使用默认解码规则解码三个通道
      midPixels[index] = dnaByte2Byte(currDNAByte3Channel[0], defaultRule);
      midPixels[index + 1] = dnaByte2Byte(currDNAByte3Channel[1], defaultRule);
      midPixels[index + 2] = dnaByte2Byte(currDNAByte3Channel[2], defaultRule);
      // 图像A值保持不变
      midPixels[index + 3] = pixels[index + 3];
    }
  }
  // 输出
  return {
    name,
    buffer: midPixels.buffer,
    width,
    height,
  };
};

export { encrypt, decrypt };
