import { useEffect, useState } from "react";
import { loadDefaultPlugins, encrypt } from "@/service/image";
import List from "@/components/List";
export default function ControlPanel() {
  const [quality, setQuality] = useState(50);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      setQuality(value);
    }
  };
  useEffect(() => {
    //TODO: 加载默认插件,之后应该在某处只执行一次
    loadDefaultPlugins();
  }, []);
  const handleStart = async () => {
    setIsEncrypting(true);
    encrypt("algorithmA");
  };

  const handleCancel = () => {
    setIsEncrypting(false);
    // TODO: cancel encryption
  };

  return (
    <div className="h-full relative flex flex-col text-gray-600">
      <div className="flex-1 p-2">
        {/* 算法列表 */}
        <List options={["123", "3123", "31231"]}></List>
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
