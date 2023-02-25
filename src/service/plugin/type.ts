//插件的元信息
export type Plugin = {
  name: string;
  version: string;
  description: string;
  language: string;
  path: string;
};
//插件的具体实现
export type PluginModule = {
  default: {
    // 插件的实现
    // ...
  };
};
