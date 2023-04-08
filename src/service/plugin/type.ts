//插件的加载函数
export type ModuleFunc = (...args: any[]) => Promise<any>;
//插件的元信息
export type Plugin = {
  name: string;
  version: string;
  description: string;
  language: string;
  moduleFunc: ModuleFunc;
  keyRule: {
    regex: string;
    required: boolean;
    message: string;
  };
};
