import { PixelBuffer } from "@/service/image/type";
import { writeMsgToImage, readMsgFromImage } from "./dct";
type encryptFuncType = (
  data: PixelBuffer,
  key: string,
  options: { message: string; repeat: number }
) => {
  data: PixelBuffer;
  payload?: string;
};

type decryptFuncType = (
  data: PixelBuffer,
  key: string,
  options: { repeat: number }
) => {
  data: PixelBuffer;
  payload: string;
};
//图像隐写
const encrypt: encryptFuncType = (data, key, { message, repeat }) => {
  //如果消息为空，则直接返回原图像
  if (!message?.trim()) {
    return {
      data,
    };
  }
  const resData = writeMsgToImage(data, message, key, repeat);
  return {
    data: resData,
    payload: message,
  };
};
//图像提取
const decrypt: decryptFuncType = (data, key, { repeat }) => {
  const payload = readMsgFromImage(data, key, repeat);
  return {
    data,
    payload,
  };
};

export { encrypt, decrypt };
