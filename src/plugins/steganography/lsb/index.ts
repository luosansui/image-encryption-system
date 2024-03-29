import { PixelBuffer } from "@/service/image/type";
import { writeMsgToImage, readMsgFromImage } from "./lsb";
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
const encrypt: encryptFuncType = (data, key, { message }) => {
  //如果消息为空，则直接返回原图像
  if (!message?.trim()) {
    return {
      data,
    };
  }
  const resData = writeMsgToImage(data, message, key);
  return {
    data: resData,
    payload: message,
  };
};
//图像提取
const decrypt: decryptFuncType = (data, key) => {
  const payload = readMsgFromImage(data, key);
  return {
    data,
    payload,
  };
};

export { encrypt, decrypt };
