import React, { useEffect, useRef, useState } from "react";
import ImageService from "@/service/image";
import { Plugin } from "@/service/plugin/type";
import List from "@/components/List";
import { FileType } from "@/components/Upload/type";
import Button from "@/components/Button";

const Item = (props: { label: string; children?: React.ReactNode }) => {
  return (
    <div className="flex items-center mb-4">
      <div
        className="w-[64px] mr-3 whitespace-nowrap text-justify"
        style={{ textAlignLast: "justify" }}
      >
        {props.label}
      </div>
      {props.children}
    </div>
  );
};

export default function ControlPanel({
  fileList,
  handleGenerateResult,
  className,
}: {
  fileList: FileType[];
  handleGenerateResult?: (files: [FileType, FileType]) => void;
  className?: string;
}) {
  const [quality, setQuality] = useState(50);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [pluginName, setPluginName] = useState<string>("未载入插件");
  const [pluginList, setPluginList] = useState<Plugin[]>([]);
  const imageService = useRef<ImageService | null>(null);

  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
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
    const resList = imageService.current!.encrypt(pluginName, fileList, "");
    //处理加密结果
    resList.forEach(async (promisePair) => {
      const pair = await promisePair;
      handleGenerateResult?.(pair);
    });
  };

  const handleCancel = () => {
    setIsEncrypting(false);
    // TODO: cancel encryption
  };
  //初始化服务
  const initImageService = async () => {
    try {
      imageService.current = new ImageService();
      await imageService.current.initService();
      const plugins = imageService.current.getPlugins();
      console.log("plugins", plugins);
      if (plugins.length) {
        setPluginList(plugins);
        setPluginName(plugins[0]?.name ?? "未命名插件");
      }
    } catch (error) {
      console.error(error);
    }
  };
  //选择算法插件改变
  const handlePluginChange = (pluginName: string) => {
    setPluginName(pluginName);
  };

  //载入图片业务
  useEffect(() => {
    initImageService();
    return () => {
      imageService.current = null;
    };
  }, []);

  return (
    <div className={`text-gray-600 p-2 ${className ?? ""}`}>
      {/* 算法列表 */}
      <List
        options={pluginList}
        onChange={handlePluginChange}
        className="mb-4"
      ></List>

      {/* 选择操作 */}
      <ul className="grid w-full gap-4 md:grid-cols-2 mb-5">
        <li>
          <input
            type="radio"
            id="hosting-small"
            name="hosting"
            value="hosting-small"
            className="hidden peer"
            required
          />
          <label
            htmlFor="hosting-small"
            className="inline-flex items-center justify-between w-full p-4 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
              <div className="w-full text-lg font-semibold">加密图像</div>
              <div className="w-full">使用本算法加密所有图像</div>
            </div>
            <svg
              aria-hidden="true"
              className="w-10 h-10 ml-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </label>
        </li>
        <li>
          <input
            type="radio"
            id="hosting-small"
            name="hosting"
            value="hosting-small"
            className="hidden peer"
            required
          />
          <label
            htmlFor="hosting-small"
            className="inline-flex items-center justify-between w-full p-4 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
              <div className="w-full text-lg font-semibold">解密图像</div>
              <div className="w-full">使用本算法解密所有图像</div>
            </div>
            <svg
              aria-hidden="true"
              className="w-10 h-10 ml-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </label>
        </li>
      </ul>

      {/* 秘钥 */}
      <Item label="秘钥">
        <input
          type="text"
          className="bg-gray-50 border flex-1 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </Item>
      {/* 是否隐写秘钥 */}

      <Item label="秘钥隐写">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </Item>

      {/* 文件格式 */}
      <Item label="文件格式">
        <List
          options={pluginList}
          onChange={handlePluginChange}
          className="flex-1"
        ></List>
      </Item>
      {/* 图像质量 */}
      <Item label="图像质量">
        <input
          type="range"
          min="0"
          max="100"
          value={quality}
          onChange={handleQualityChange}
          className="w-72"
        />
        <span className="text-sm ml-1 w-7 text-center">{quality}</span>
      </Item>

      <div className="text-center mt-3">
        <Button onClick={handleStart} disabled={isEncrypting} className="w-1/3">
          开始
        </Button>
      </div>
    </div>
  );
}
