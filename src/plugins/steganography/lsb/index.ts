import { PixelBuffer } from "@/service/image/type";
type encryptFuncType = (
  data: PixelBuffer,
  key: string,
  options: { message: string; repeat: number }
) => Promise<{
  data: PixelBuffer;
  payload?: string;
}>;

type decryptFuncType = (
  data: PixelBuffer,
  key: string,
  options: { repeat: number }
) => Promise<{
  data: PixelBuffer;
  payload: string;
}>;
//图像隐写
const encrypt: encryptFuncType = async (data, key, { message, repeat }) => {
  const { writeMsgToImage } = await import("./lsb");
  //如果消息为空，则直接返回原图像
  if (!message?.trim()) {
    return {
      data,
    };
  }
  const resData = await writeMsgToImage(data, message, key, repeat);
  return {
    data: resData,
    payload: message,
  };
};
//图像提取
const decrypt: decryptFuncType = async (data, key, { repeat }) => {
  const { readMsgFromImage } = await import("./lsb");
  const payload = readMsgFromImage(data, key, repeat);
  return {
    data,
    payload,
  };
};

export { encrypt, decrypt };
