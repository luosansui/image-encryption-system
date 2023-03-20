import { PixelBuffer } from "@/service/image/type";

type EmbedFunction = (
  data: PixelBuffer,
  secretMessage: string
) => Promise<PixelBuffer>;
//图像隐写
const embed: EmbedFunction = async (acceptData, secretMessage) => {
  return acceptData;
};
//图像提取
const extract = embed;

export { embed, extract };
