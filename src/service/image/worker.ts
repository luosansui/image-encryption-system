import { FileType } from "@/components/Upload/type";
import {
  file2FileType,
  file2PixelsBuffer,
  pixelsBuffer2File,
} from "@/utils/file";
import { ExecFuncType } from "./type";
//算法
import * as encry_dna from "@/plugins/encryption/DNA";
import * as encry_arnold from "@/plugins/encryption/Arnold";
import * as encry_logistic from "@/plugins/encryption/Logistic";
import * as encry_tent from "@/plugins/encryption/Tent";
import * as stega_lsb from "@/plugins/steganography/LSB";
const MODULE_MAP = {
  encry_dna,
  encry_arnold,
  encry_logistic,
  encry_tent,
  stega_lsb,
};
//缓存函数;
let cachedModule: any | null = null;

const handle = async (
  origin: FileType, //原始文件
  secretKey: string, //密钥
  funcName: string, //要执行的函数名称
  options: {
    format?: string;
    quality?: number;
    message?: string;
    repeat?: number;
  } = {}
) => {
  //获取文件buffer
  const pixelBuffer = await file2PixelsBuffer(origin.file);
  const { format, quality, ...optionArgs } = options;
  //使用缓存函数处理
  const execFunc: ExecFuncType = cachedModule[funcName];
  if (typeof execFunc !== "function") {
    throw new Error("未找到对应的处理函数: " + funcName);
  }
  const resultData = await execFunc(pixelBuffer, secretKey, optionArgs);
  //转换为文件
  const file = await pixelsBuffer2File(resultData.data, format, quality);
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
      args?: [FileType, string, string, any];
      module?: string;
    }>
  ) => {
    const { args, module } = event.data;
    if (module) {
      //反序列化函数并获取模块
      try {
        //获取函数字符串
        cachedModule = MODULE_MAP[module as keyof typeof MODULE_MAP];
      } catch (error) {
        console.error("获取模块失败: ", error);
      }
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
