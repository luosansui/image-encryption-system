import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Plugin } from "@/service/plugin/type";
import List from "@/components/List";
import Button from "@/components/Button";
import { IMAGE_FORMATS, OPTION_CARDS } from "./constant";
import { capitalizeFirstLetter } from "@/utils/string";
import { ControlOptionType, ImageFormatType } from "./type";
import CardSelect from "@/components/CardSelect";

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
  onStart, //开始加密
  className, //类名
  pluginList, //插件列表
  disabled, //是否正在加密
}: {
  onStart?: (option: ControlOptionType) => void;
  className?: string;
  pluginList: Plugin[];
  disabled?: boolean;
}) {
  //插件名称
  const [pluginName, setPluginName] = useState<string>("");
  //选项卡名称
  const [optionName, setOptionName] = useState<"encrypt" | "decrypt">(
    "encrypt"
  );
  //密钥
  const [key, setKey] = useState<string>("");
  //是否开启密钥隐写
  const [isEmbedKey, setIsEmbedKey] = useState(false);
  //图像格式
  const [format, setFormat] = useState<ImageFormatType>("");
  //图片质量
  const [quality, setQuality] = useState(100);
  //是否禁用密钥输入
  const [isKeyDisabled, setIsKeyDisabled] = useState(false);
  //是否禁用图像质量
  const [isQualityDisabled, setIsQualityDisabled] = useState(false);
  /**
   * 开始加密
   */
  const handleStart = () => {
    onStart?.({
      pluginName,
      optionName,
      key,
      isEmbedKey,
      format,
      quality,
    });
  };

  /**
   * 选择算法插件改变
   * @param pluginName 插件名称
   */
  const handlePluginChange = (plugin: Plugin) => {
    setPluginName(plugin?.name ?? "");
  };

  /**
   * 要执行的操作改变
   * @param event 事件对象
   */
  const handleOptionChange = (value: number) => {
    const options: ["encrypt", "decrypt"] = ["encrypt", "decrypt"];
    setOptionName(options[value]);
  };

  /**
   * 图像质量改变
   * @param event 事件对象
   */
  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setQuality(value);
    }
  };
  /**
   * 图像格式改变
   */
  const handleImageFormatChange = ({ value }: { value: ImageFormatType }) => {
    setFormat(value);
  };

  /**
   * 密钥改变
   * @param event 事件对象
   */
  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKey(value);
  };

  /**
   * 密钥隐写功能开关
   */
  const handleEmbedKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmbedKey(event.target.checked);
  };

  /**
   * 渲染插件已选择的内容
   */
  const renderPluginSelected = (option: Plugin) => {
    return option.name ?? "未载入算法";
  };

  /**
   * 渲染插件列表
   */
  const renderPluginList = (option: Plugin) => {
    return (
      <Fragment>
        <div className="font-semibold">{option.name}</div>
        <div className="text-xs truncate my-1">{option.description}</div>
        <div className="flex justify-between text-xs ">
          <span className="text-gray-500">
            {capitalizeFirstLetter(option.language)}
          </span>
          <span className="text-gray-400">{option.version}</span>
        </div>
      </Fragment>
    );
  };

  /**
   * 渲染列表的底部
   */
  const renderPluginListFooter = () => {
    return (
      <button
        className="w-full py-2 border-t-2 border-gray-100 text-blue-500"
        //onClick={handleAddOption}
      >
        添加算法
      </button>
    );
  };
  //key输入框是否禁用
  useEffect(() => {
    setIsKeyDisabled(optionName === "decrypt" && isEmbedKey);
  }, [isEmbedKey, optionName]);

  //图像质量输入框是否禁用
  useEffect(() => {
    const disabledResult =
      format !== "image/jpeg" && format !== "image/webp" && format !== "";
    if (disabledResult) {
      setQuality(100);
    }
    setIsQualityDisabled(disabledResult);
  }, [format]);
  //pluginList改变时，重置插件名称
  useEffect(() => {
    setPluginName(pluginList[0]?.name ?? "");
  }, [pluginList]);
  //图像质量描述
  const qualityLabel = useMemo(() => {
    if (quality === 100) {
      return "无损";
    } else if (quality === 0) {
      return "最低";
    } else {
      return `${quality}%`;
    }
  }, [quality]);

  return (
    <div className={`text-gray-600 p-2 ${className ?? ""}`}>
      {/* 算法列表 */}
      <List
        options={pluginList}
        disabled={disabled}
        onChange={handlePluginChange}
        renderSelected={renderPluginSelected}
        renderList={renderPluginList}
        renderFooter={renderPluginListFooter}
        className="mb-4"
      ></List>

      {/* 选择操作 */}
      <CardSelect
        options={OPTION_CARDS}
        disabled={disabled}
        onChange={handleOptionChange}
      />

      {/* 秘钥 */}
      <Item label="秘钥">
        <input
          type="text"
          value={key}
          disabled={disabled || isKeyDisabled}
          onChange={handleKeyChange}
          className={`${
            isKeyDisabled ? "!bg-gray-200" : ""
          } bg-gray-50 border flex-1 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
        />
      </Item>
      {/* 是否隐写秘钥 */}
      <Item label="秘钥隐写">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEmbedKey}
            disabled={disabled}
            onChange={handleEmbedKeyChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </Item>
      {/* 文件格式 */}
      <Item label="文件格式">
        <List
          options={IMAGE_FORMATS}
          disabled={disabled}
          onChange={handleImageFormatChange}
          renderSelected={(item) => item.label}
          renderList={(list) => list.label}
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
          disabled={disabled || isQualityDisabled}
          onChange={handleQualityChange}
          className="w-72"
        />
        <span className="whitespace-nowrap text-sm ml-1 w-7 text-center">
          {qualityLabel}
        </span>
      </Item>

      <div className="text-center mt-3">
        <Button onClick={handleStart} disabled={disabled} className="w-1/4">
          开始
        </Button>
      </div>
    </div>
  );
}
