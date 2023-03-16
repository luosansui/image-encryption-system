import { PixelBuffer } from "@/service/image/type";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;

const encrypt: encryptFuncType = async (data, secretKey) => {
  return data;
};
const decrypt = encrypt;

export { encrypt, decrypt };
