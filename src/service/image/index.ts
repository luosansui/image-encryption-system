import PluginService from "@/service/plugin";
import { Plugin } from "@/service/plugin/type";

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
            path: `${key}.js`,
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
//图像加密
export const encrypt = (pluginName: string) => {
  if (!pluginService) {
    throw new Error("插件服务未初始化");
  }
  const pluginInstance = pluginService.getPluginInstance<{
    encrypt: () => void;
  }>(pluginName);
  pluginInstance.encrypt();
};
