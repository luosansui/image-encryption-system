import { FileType } from "@/components/Upload/type";
import { ControlOptionType as OptionEncryType } from "@/pages/encryption/ControlPanel/type";
import { ControlOptionType as OptionStegaType } from "@/pages/steganography/ControlPanel/type";
import PluginService from "@/service/plugin";
import { Plugin } from "@/service/plugin/type";
import { getThreadsNumber } from "@/utils";
import { createURL4FileType } from "@/utils/file";
import WorkService from "../worker";
import { encryptFuncType, PluginJson, progressStatus } from "./type";
import WorkerThread from "./worker?worker";
/**
 * 图像服务
 */
class ImageService {
  private readonly pluginService: PluginService = new PluginService(); //插件服务
  /**
   * 初始化，不处理任何错误，直接抛出
   */
  public async initService(module: "encryption" | "steganography") {
    const modules =
      module === "encryption"
        ? import.meta.glob("@/plugins/encryption/**/index.json")
        : import.meta.glob("@/plugins/steganography/**/index.json");
    const modulesKeySet = new Set(
      Object.keys(modules).map((key) => key.replace(/\.[^/.]+$/, ""))
    );
    //读取配置信息，载入插件
    const initResultPromise = Array.from(
      modulesKeySet,
      (key) =>
        new Promise((res, rej) => {
          console.log("key", key);
          const load = async () => {
            const pluginJson = (await modules[`${key}.json`]()) as PluginJson;
            return this.loadPlugin({
              ...pluginJson.default,
              path: key,
            });
          };
          load().then(res).catch(rej);
        })
    );
    //插件载入结果
    await Promise.all(initResultPromise);
    return true;
  }
  /**
   * 加载插件，不处理任何错误，直接抛出
   */
  public loadPlugin(plugin: Plugin) {
    if (!this.pluginService) {
      throw new Error("插件服务未初始化");
    }
    return this.pluginService.loadPlugin(plugin);
  }
  /**
   * 获取插件列表
   * @returns Plugin[]
   */
  public getPlugins() {
    if (!this.pluginService) {
      console.error("插件服务未初始化");
      return [];
    }
    return this.pluginService.getPlugins();
  }
  /**
   * 获取算法实例，不处理任何错误，直接抛出
   * @param pluginName 插件名称
   * @returns 插件实例
   */
  private getInstance(pluginName: string) {
    if (!this.pluginService) {
      throw new Error("插件服务未初始化");
    }
    if (!pluginName) {
      throw new Error("未选择插件");
    }
    const { encrypt, decrypt } = this.pluginService.getPluginInstance<{
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
  }

  /**
   * 图像处理,不处理错误直接抛出
   * @param files 图像列表
   * @param options 详细操作
   * @param onprogress 进度回调
   * @returns
   */
  public processing(
    files: FileType[],
    options: OptionEncryType | OptionStegaType,
    type: "encryption" | "steganography",
    onprogress: (status: progressStatus) => void
  ) {
    //获取算法实例
    onprogress?.({
      done: false,
      message: "正在获取算法实例...",
      error: null,
    });
    const { pluginName, optionName, key } = options;
    const exeFunc = this.getInstance(pluginName)[optionName];
    if (files.length === 0) {
      return [];
    }
    //获取较优线程数，并实例化多线程服务
    onprogress?.({
      done: false,
      message: "正在初始化多线程服务...",
      error: null,
    });
    const threadNum = getThreadsNumber(files.length);
    const workService = new WorkService(threadNum, exeFunc, WorkerThread);
    //执行操作
    const result = files.map(
      async (origin): Promise<[FileType, FileType, any] | null> => {
        //通知进度
        onprogress?.({
          done: false,
          message: "正在执行图像处理...",
          error: null,
        });
        //执行操作
        let args: any = {};
        if (type === "encryption") {
          const opts = options as OptionEncryType;
          args = {
            format: opts.format || origin.file.type,
            quality: opts.quality || 1,
          };
        } else {
          const opts = options as OptionStegaType;
          args = {
            message: opts.message,
            repeat: opts.repeat,
          };
        }
        //执行操作
        const outputData = await workService.run<{
          data: FileType;
          payload?: any;
        }>(origin, key, args);
        //如果没有结果则返回null
        if (!outputData) {
          return null;
        }
        //通知进度
        const newFile = createURL4FileType(outputData.data);
        return [origin, newFile, outputData.payload];
      }
    );
    //监听result用于通知进度
    Promise.all(result).then((res) => {
      const hasEmpty = res.some((item) => !item);
      if (hasEmpty) {
        onprogress?.({
          done: true,
          message: "部分图像处理失败",
          error: new Error("部分图像处理失败"),
        });
      } else {
        onprogress?.({
          done: true,
          message: "图像处理完成",
          error: null,
        });
      }
    });
    return result;
  }
}

export default ImageService;
