import { FileType } from "@/components/Upload/type";
import PluginService from "@/service/plugin";
import { Plugin } from "@/service/plugin/type";
import { getThreadsNumber } from "@/utils";
import {
  calculateMD5,
  file2PixelsBuffer,
  pixelsBuffer2File,
} from "@/utils/file";
import { twoThirds } from "@/utils/number";

import { FileCache } from "../Cache";
import WorkService from "../worker";
import { encryptFuncType } from "./type";

type PluginJson = Omit<Plugin, "path"> & {
  default: Omit<Plugin, "path">;
};
//插件服务实例
let pluginService: PluginService | undefined | null;
//缓存服务实例
let originFileCache: FileCache | undefined | null;
//初始化插件系统
export const initService = () => {
  console.log("实例化插件服务");
  pluginService = new PluginService();
  console.log("实例化缓存服务");
  originFileCache = new FileCache();
  //销毁函数是否执行
  let isDestroyedExecute = false;
  const modules = import.meta.glob("@/plugins/**");
  const modulesKeySet = new Set(
    Object.keys(modules).map((key) => key.replace(/\.[^/.]+$/, ""))
  );
  //读取配置信息，载入插件
  const initResultPromise = Array.from(
    modulesKeySet,
    (key) =>
      new Promise(async (res, rej) => {
        const pluginJson = (await modules[`${key}.json`]()) as PluginJson;
        if (!isDestroyedExecute) {
          const plugin: Plugin = {
            ...pluginJson.default,
            path: key,
          };
          await loadOtherPlugin(plugin);
          res(null);
        } else {
          rej(null);
        }
      })
  );
  //插件载入结果
  const initResult = Promise.all(initResultPromise)
    .then(() => {
      return true;
    })
    .catch((error) => {
      return false;
    });
  return {
    result: initResult,
    destroyed: () => {
      isDestroyedExecute = true;
      pluginService = null;
      console.log("销毁插件服务");
      originFileCache = null;
      console.log("销毁缓存服务");
    },
  };
};
//加载算法插件
export const loadOtherPlugin = async (plugin: Plugin) => {
  try {
    if (!pluginService) {
      throw new Error("插件服务未初始化");
    }
    await pluginService.loadPlugin(plugin);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
//获取算法列表
export const getPlugins = () => {
  if (!pluginService) {
    return [];
  }
  return pluginService.getPlugins();
};
//获取算法实例
const getInstance = (pluginName: string) => {
  if (!pluginService) {
    throw new Error("插件服务未初始化");
  }
  if (!pluginName) {
    throw new Error("未选择插件");
  }
  const { encrypt, decrypt } = pluginService.getPluginInstance<{
    encrypt: encryptFuncType;
    decrypt: encryptFuncType;
  }>(pluginName);
  if (!encrypt) {
    throw new Error("插件未实现加密方法");
  }
  if (!decrypt) {
    throw new Error("插件未实现解密方法");
  }
  return { encrypt, decrypt };
};
//图像加密
export const encrypt = (
  pluginName: string,
  files: FileType[],
  secretKey: string
) => {
  //获取算法实例
  const { encrypt } = getInstance(pluginName);
  //缓存服务,已经解密过的文件不再解密
  if (!originFileCache) {
    throw new Error("缓存服务未初始化");
  }
  //未处理的文件列表
  const unprocessedFiles = files.filter((item) => !originFileCache?.has(item));
  //TODO:多线程服务，多线程解密
  const threadNum = getThreadsNumber(unprocessedFiles.length) || 1;
  const worker = new WorkService(threadNum, encrypt);
  //加密
  const pair = unprocessedFiles.map<[FileType, Promise<FileType>]>((origin) => [
    origin,
    new Promise<FileType>(async (res) => {
      const { buffer, width, height, name } = await file2PixelsBuffer(
        origin.file
      );
      const file = await pixelsBuffer2File(
        {
          buffer: await worker.run<ArrayBuffer>(buffer, secretKey),
          width,
          height,
          name,
        },
        "image/png"
      );
      //已加密的文件
      const resultFile = {
        file,
        md5: await calculateMD5(file),
        src: URL.createObjectURL(file),
      };
      //原图计入缓存
      originFileCache?.add(origin);
      //返回加密后的文件
      res(resultFile);
    }),
  ]);
  return pair;
};
//图像解密
export const decrypt = (
  pluginName: string,
  files: FileType[],
  secretKey: string
) => {
  if (!pluginService) {
    throw new Error("插件服务未初始化");
  }
  const fileList = files.map((fileData) => fileData.file);
  const pluginInstance = pluginService.getPluginInstance<{
    decrypt: encryptFuncType;
  }>(pluginName);
  return [];
};
