type encryptFuncType = (data: ArrayBuffer, key: string) => ArrayBuffer;

const encrypt: encryptFuncType = (pixelData, secretKey) => {
  const str2Num = (str: string): number => {
    return 54544564646;
  };
  // 混沌初始化，生成随机数种子
  const initChaos = (seed: number) => {
    const x = seed;
    const y = seed * seed;
    const z = seed * seed * seed;
    return [x, y, z];
  };
  const dataLength = pixelData.byteLength;
  const pixelBuffer = new Uint8Array(pixelData);
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
  return pixelBuffer.buffer;
};
const decrypt = encrypt;

export { encrypt, decrypt };
