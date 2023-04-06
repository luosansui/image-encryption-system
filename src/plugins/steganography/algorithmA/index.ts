import { PixelBuffer } from "@/service/image/type";
type encryptFuncType = (
  data: PixelBuffer,
  key: string,
  message: string
) => Promise<{
  data: PixelBuffer;
  payload?: string;
}>;

type decryptFuncType = encryptFuncType;
//图像隐写
const encrypt: encryptFuncType = async (data, key, message) => {
  const { writeMsgToImage } = await import("@/utils/cryptostego/setimg");
  //如果消息为空，则直接返回原图像
  if (!message.trim()) {
    return {
      data,
    };
  }
  const resData = await writeMsgToImage(data, message, key, false, 1);
  return {
    data: resData,
    payload: message,
  };
};
//图像提取
const decrypt: decryptFuncType = async (data, key) => {
  //获取图像的像素数据
  const imageData = new Uint8ClampedArray(data.buffer);
  const pixels = imageData.slice(54);

  //从图像中提取隐藏的消息
  let binaryMessage = "";
  for (let i = 0; i < pixels.length; i += 4) {
    const pixel = pixels[i];
    const bit = pixel & 0x01;
    binaryMessage += bit.toString();
  }

  //将二进制消息转换为字符串
  let message = "";
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.slice(i, i + 8);
    const charCode = parseInt(byte, 2);
    const char = String.fromCharCode(charCode);
    message += char;
  }

  return {
    data: data,
    payload: message,
  };
};

export { encrypt, decrypt };
