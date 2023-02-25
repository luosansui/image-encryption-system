import { FileType } from "@/components/Upload/type";
import PluginService from "@/service/plugin";
import { Plugin } from "@/service/plugin/type";
import {
  calculateMD5,
  file2PixelsBuffer,
  pixelsBuffer2File,
} from "@/utils/file";
import { str2Num } from "@/utils/string";
import { encryptFuncType } from "./type";

type PluginJson = Omit<Plugin, "path"> & {
  default: Omit<Plugin, "path">;
};
//插件实例
let pluginService: PluginService | undefined | null;
//初始化插件系统
export const initPluginService = () => {
  console.log("实例化插件服务");
  pluginService = new PluginService();
  //当前载入的插件是否被销毁
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
export const encrypt = async (
  pluginName: string,
  files: FileType[],
  secretKey: string
) => {
  //获取算法实例
  const { encrypt } = getInstance(pluginName);
  //加密
  const pair = files.map<[FileType, Promise<FileType>]>((item) => [
    item,
    new Promise<FileType>(async (res) => {
      const { buffer, width, height, name } = await file2PixelsBuffer(
        item.file
      );
      const file = await pixelsBuffer2File(
        {
          buffer: encrypt(buffer, secretKey),
          width,
          height,
          name,
        },
        "image/png"
      );
      const md5 = await calculateMD5(file);
      res({
        file,
        md5,
        src: URL.createObjectURL(file),
      });
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
  //TODO:缓存服务,已经解密过的文件不再解密
  //TODO:多线程服务，多线程解密
  const fileList = files.map((fileData) => fileData.file);
  const pluginInstance = pluginService.getPluginInstance<{
    decrypt: encryptFuncType;
  }>(pluginName);
  return [];
};
