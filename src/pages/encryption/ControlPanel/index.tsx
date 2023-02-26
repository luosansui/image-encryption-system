import { useEffect, useState } from "react";
import { initPluginService, encrypt, getPlugins } from "@/service/image";
import { Plugin } from "@/service/plugin/type";
import List from "@/components/List";

export default function ControlPanel() {
  const [quality, setQuality] = useState(50);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [pluginList, setPluginList] = useState<Plugin[]>([]);

  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setQuality(value);
    }
  };
  const handleStart = async () => {
    setIsEncrypting(true);
    encrypt("algorithmA");
  };

  const handleCancel = () => {
    setIsEncrypting(false);
    // TODO: cancel encryption
  };
  //初始化插件系统
  const initPlugin = () => {
    const { destroyed, result } = initPluginService();
    result.then((res) => {
      if (res) {
        const plugins = getPlugins();
        console.log("plugins", plugins);
        setPluginList(plugins);
      }
    });
    return destroyed;
  };
  //载入图片算法插件系统
  useEffect(() => initPlugin(), []);

  return (
    <div className="h-full relative flex flex-col text-gray-600">
      <div className="flex-1 p-2">
        {/* 算法列表 */}
        <div className="flex items-center mb-4">
          <div className="mr-2">选择算法</div>
          <List className="flex-1" options={pluginList}></List>
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
          disabled={isEncrypting}
        >
          开始
        </button>
        <button
          type="button"
          className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 shadow font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleCancel}
          disabled={!isEncrypting}
        >
          取消
        </button>
      </div>
    </div>
  );
}
