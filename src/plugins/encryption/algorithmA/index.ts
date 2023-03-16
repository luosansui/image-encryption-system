import { PixelBuffer } from "@/service/image/type";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;

const encrypt: encryptFuncType = async (data, secretKey) => {
  const { buffer, width, height, name } = data;
  // 混沌初始化，生成随机数种子
  const initChaos = (seed: number) => {
    const x = seed;
    const y = seed * seed;
    const z = seed * seed * seed;
    return [x, y, z];
  };
  const { str2Num } = await import("@/utils/string");
  const dataLength = buffer.byteLength;
  const pixelBuffer = new Uint8Array(buffer);
  const tempBuffer = new Uint8Array(dataLength);
  tempBuffer.set(pixelBuffer);
  const key = str2Num(secretKey);
  let [x, y, z] = initChaos(key);
  for (let i = 0; i < dataLength; i++) {
    const temp = x ^ y ^ z;
    tempBuffer[i] = pixelBuffer[i] ^ temp;
    x = y;
    y = z;
    z = temp;
  }

  pixelBuffer.set(tempBuffer);
  return {
    buffer: pixelBuffer.buffer,
    width,
    height,
    name,
  };
};
const decrypt = encrypt;

export { encrypt, decrypt };
