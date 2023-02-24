import pluginService from "@/service/plugin";
import { Plugin } from "@/service/plugin/type";

type PluginJson = Omit<Plugin, "path"> & {
  default: Omit<Plugin, "path">;
};
//加载默认算法插件
export const loadDefaultPlugins = async () => {
  const modules = import.meta.glob("@/plugins/**");
  const modulesKeySet = new Set(
    Object.keys(modules).map((key) => key.replace(/\.[^/.]+$/, ""))
  );
  modulesKeySet.forEach(async (key) => {
    const pluginJson = (await modules[`${key}.json`]()) as PluginJson;
    const plugin: Plugin = {
      ...pluginJson.default,
      path: `${key}.js`,
    };
    loadOtherPlugin(plugin);
  });
};
//加载算法插件-绝对路径
export const loadOtherPlugin = async (plugin: Plugin) => {
  try {
    await pluginService.loadPlugin(plugin);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
//图像加密
export const encrypt = (pluginName: string) => {
  const pluginInstance = pluginService.getPluginInstance<{
    encrypt: () => void;
  }>(pluginName);
  pluginInstance.encrypt();
};
