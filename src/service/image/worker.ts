import { FileType } from "@/components/Upload/type";
import {
  file2FileType,
  file2PixelsBuffer,
  pixelsBuffer2File,
} from "@/utils/file";

import { deserializeFunction } from "@/utils/function";
import { PixelBuffer } from "./type";
//缓存函数;
let cachedFunction: ((...args: any[]) => any) | null = null;

const handle = async (
  origin: FileType,
  secretKey: string,
  options: {
    MIME?: string;
    quality?: number;
    target?: string;
  } = {}
) => {
  //获取文件buffer
  const pixelBuffer = await file2PixelsBuffer(origin.file);
  //使用缓存函数处理
  const resultData: {
    data: PixelBuffer;
    payload?: any;
  } = await cachedFunction!(pixelBuffer, secretKey, options.target);
  //转换为文件
  const file = await pixelsBuffer2File(
    resultData.data,
    options.MIME,
    options.quality
  );
  //计算md5
  const data = await file2FileType(file, null, false, true);
  const payload = resultData.payload;
  /**
   * 严重注意事项：不能再worker进程中计算Blob URL
   * 则当worker进程结束时对应的内存会被释放
   * 虽然结束前渲染到页面上的图片正常显示了，但是实际上图片已经被释放了，链接不可再次访问
   * 结束后渲染到页面上的图片会直接404
   */
  //已加密的文件
  return {
    data,
    payload,
  };
};
//注册监听事件
self.addEventListener(
  "message",
  async (
    event: MessageEvent<{
      args?: [FileType, string, any];
      func?: ArrayBuffer;
    }>
  ) => {
    const { args, func } = event.data;
    if (func) {
      cachedFunction = deserializeFunction(func);
    } else if (args) {
      // 执行缓存函数
      try {
        const result = await handle(...args);
        //发送数据
        self.postMessage(result);
      } catch (error) {
        console.error("图像处理失败: ", error);
        self.postMessage(null);
      }
    }
  }
);
export {};
