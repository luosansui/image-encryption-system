//插件的元信息
export type Plugin = {
  name: string;
  key: string;
  version: string;
  description: string;
  language: string;
  keyRule: {
    regex: string;
    required: boolean;
    message: string;
  };
};
