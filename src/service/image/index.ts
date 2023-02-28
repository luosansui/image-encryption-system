import { FileType } from "@/components/Upload/type";
import PluginService from "@/service/plugin";
import { Plugin } from "@/service/plugin/type";
import { getThreadsNumber } from "@/utils";
import { FileCache } from "../Cache";
import WorkService from "../worker";
import { encryptFuncType, PluginJson, processImageFuncArgsType } from "./type";
import WorkerThread from "./worker?worker";
/**
 * 图像服务
 */
class ImageService {
  private readonly pluginService: PluginService = new PluginService(); //插件服务
  private readonly originFileCache: FileCache = new FileCache(); //缓存服务
  private workService: WorkService | null = null; //多线程服务，需要时才初始化
  /**
   * 初始化，不处理任何错误，直接抛出
   */
  public async initService() {
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
          this.loadOtherPlugin({
            ...pluginJson.default,
            path: key,
          })
            .then(res)
            .catch(rej);
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
   * 图像解密，不处理任何错误，直接抛出
   * @param pluginName 算法名称
   * @param files 图像列表
   * @param secretKey 密钥
   * @returns
   */
  public encrypt(...args: processImageFuncArgsType) {
    return this.processing(...args, "encrypt");
  }
  /**
   * 图像解密，不处理任何错误，直接抛出
   * @param pluginName 算法名称
   * @param files 图像列表
   * @param secretKey 密钥
   * @returns
   */
  public decrypt(...args: processImageFuncArgsType) {
    return this.processing(...args, "decrypt");
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
   * 图像处理，不处理任何错误，直接抛出
   * @param pluginName 算法名称
   * @param files 图像列表
   * @param secretKey 密钥
   * @returns
   */
  private processing(
    pluginName: string,
    files: FileType[],
    secretKey: string,
    type: "encrypt" | "decrypt"
  ) {
    //获取算法实例
    const exeFunc = this.getInstance(pluginName)[type];
    //缓存服务,已经解密过的文件不再解密
    if (!this.originFileCache) {
      throw new Error("缓存服务未初始化");
    }
    //从缓存服务中过滤未解密过的文件
    const unProcessedFiles = this.originFileCache.filterNotHas(files);
    if (unProcessedFiles.length === 0) {
      return [];
    }
    //实例化多线程服务
    if (!this.workService) {
      //获取较优线程数
      const threadNum = getThreadsNumber(unProcessedFiles.length);
      this.workService = new WorkService(threadNum, exeFunc, WorkerThread);
    }
    //执行操作
    const result = unProcessedFiles.map(
      async (origin): Promise<[FileType, FileType]> => {
        const fileWithOutSrc = await this.workService!.run<FileType>(
          origin,
          secretKey,
          "image/png"
        );
        const newFile = {
          ...fileWithOutSrc,
          src: URL.createObjectURL(fileWithOutSrc.file),
        };
        //原图计入缓存
        this.originFileCache.add(origin);
        return [origin, newFile];
      }
    );
    return result;
  }
}

export default ImageService;
