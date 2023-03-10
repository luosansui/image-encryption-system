import { FileType } from "@/components/Upload/type";
import {
  calculateMD5,
  file2PixelsBuffer,
  pixelsBuffer2File,
} from "@/utils/file";

import { deserializeFunction } from "@/utils/function";
//缓存函数;
let cachedFunction: ((...args: any[]) => any) | null = null;

const handle = async (
  origin: FileType,
  secretKey: string,
  MIME: string,
  quality: number
) => {
  //获取文件buffer
  const { buffer, width, height, name } = await file2PixelsBuffer(origin.file);
  //使用缓存函数处理
  const resultBuffer = cachedFunction!(buffer, secretKey);
  //转换为文件
  const file = await pixelsBuffer2File(
    {
      buffer: resultBuffer,
      width,
      height,
      name,
    },
    MIME,
    quality
  );
  //计算md5
  const md5 = await calculateMD5(file);
  /**
   * 严重注意事项：不能再worker进程中计算Blob URL
   * 则当worker进程结束时对应的内存会被释放
   * 虽然结束前渲染到页面上的图片正常显示了，但是实际上图片已经被释放了，链接不可再次访问
   * 结束后渲染到页面上的图片会直接404
   */
  //已加密的文件
  return { file, md5 };
};
//注册监听事件
self.addEventListener(
  "message",
  async (
    event: MessageEvent<{
      args?: [FileType, string, string, number];
      func?: ArrayBuffer;
    }>
  ) => {
    const { args, func } = event.data;
    if (func) {
      cachedFunction = deserializeFunction(func);
    } else if (args) {
      // 执行缓存函数
      const result = await handle(...args);
      //发送数据
      self.postMessage(result);
    }
  }
);
export {};
