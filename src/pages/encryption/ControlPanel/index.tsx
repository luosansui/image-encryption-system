import { useEffect, useState } from "react";
import { initService, encrypt, getPlugins } from "@/service/image";
import { Plugin } from "@/service/plugin/type";
import List from "@/components/List";
import { FileType } from "@/components/Upload/type";

export default function ControlPanel({
  fileList,
  handleGenerateResult,
}: {
  fileList: FileType[];
  handleGenerateResult?: (files: [FileType, FileType]) => void;
}) {
  const [quality, setQuality] = useState(50);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [pluginName, setPluginName] = useState<string>("");
  const [pluginList, setPluginList] = useState<Plugin[]>([]);

  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setQuality(value);
    }
  };
  //开始加密
  const handleStart = () => {
    if (!fileList.length) {
      return;
    }
    setIsEncrypting(true);
    //获取加密结果
    const resList = encrypt(pluginName, fileList, "");
    //处理加密结果
    resList.forEach(async (promisePair) => {
      const pair = await promisePair;
      handleGenerateResult?.([pair[0], pair[1]]);
    });
  };

  const handleCancel = () => {
    setIsEncrypting(false);
    // TODO: cancel encryption
  };
  //初始化服务
  const initPlugin = () => {
    const { destroyed, result } = initService();
    result.then((res) => {
      if (res) {
        const plugins = getPlugins();
        console.log("plugins", plugins);
        setPluginList(plugins);
        setPluginName(plugins[0]?.name);
      }
    });
    return destroyed;
  };
  //选择算法插件改变
  const handlePluginChange = (pluginName: string) => {
    setPluginName(pluginName);
  };

  //载入图片算法插件系统
  useEffect(() => initPlugin(), []);

  return (
    <div className="h-full relative flex flex-col text-gray-600">
      <div className="flex-1 p-2">
        {/* 算法列表 */}
        <div className="flex items-center mb-4">
          <div className="mr-2">选择算法</div>
          <List
            options={pluginList}
            onChange={handlePluginChange}
            className="flex-1"
          ></List>
        </div>
        {/* 图像质量 */}
        <div className="flex items-center">
          <span className="mr-2">图像质量</span>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={handleQualityChange}
            className="w-72"
          />
          <span className="text-sm ml-1 w-7 text-center">{quality}</span>
        </div>
      </div>
      <div className="text-center">
        <button
          type="button"
          className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 shadow font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleStart}
        >
          {isEncrypting ? "暂停" : "开始"}
        </button>
        <button
          type="button"
          className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 shadow font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleCancel}
        >
          取消
        </button>
      </div>
    </div>
  );
}
