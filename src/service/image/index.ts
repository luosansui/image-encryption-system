import { FileType } from "@/components/Upload/type";
import { ControlOptionType } from "@/pages/encryption/ControlPanel/type";
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
  public async initService() {
    const modules = import.meta.glob("@/plugins/encryption/**");
    const modulesKeySet = new Set(
      Object.keys(modules).map((key) => key.replace(/\.[^/.]+$/, ""))
    );
    //读取配置信息，载入插件
    const initResultPromise = Array.from(
      modulesKeySet,
      (key) =>
        new Promise((res, rej) => {
          const load = async () => {
            const pluginJson = (await modules[`${key}.json`]()) as PluginJson;
            return this.loadOtherPlugin({
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
   * 加载其他插件，不处理任何错误，直接抛出
   */
  public loadOtherPlugin(plugin: Plugin) {
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
    options: ControlOptionType,
    onprogress: (status: progressStatus) => void
  ) {
    //获取算法实例
    onprogress?.({
      done: false,
      message: "正在获取算法实例...",
      error: null,
    });
    const { pluginName, optionName, key, quality, format } = options;
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
    const result = files.map(async (origin): Promise<[FileType, FileType]> => {
      //获取文件类型
      const MIME = format || origin.file.type;
      //执行操作
      const outputData = await workService.run<FileType>(
        origin,
        key,
        MIME,
        quality
      );
      //通知进度
      onprogress?.({
        done: false,
        message: "正在执行图像处理...",
        error: null,
      });
      const newFile = createURL4FileType(outputData);
      return [origin, newFile];
    });
    //监听result用于通知进度
    Promise.all(result)
      .then(() => {
        onprogress?.({
          done: true,
          message: "图像处理完成",
          error: null,
        });
      })
      .catch((err) => {
        onprogress?.({
          done: true,
          message: "部分图像处理失败",
          error: err,
        });
      });
    return result;
  }
}

export default ImageService;
