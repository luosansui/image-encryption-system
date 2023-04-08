import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Plugin } from "@/service/plugin/type";
import List from "@/components/List";
import Button from "@/components/Button";
import { IMAGE_FORMATS, OPTION_CARDS } from "./constant";
import { capitalizeFirstLetter } from "@/utils/string";
import { ControlOptionType, ImageFormatType } from "./type";
import CardSelect from "@/components/CardSelect";

const Item = (props: {
  label: string;
  children?: React.ReactNode;
  message?: string;
}) => {
  return (
    <div className="flex items-center mb-4 relative">
      <div
        className="w-[64px] mr-3 whitespace-nowrap text-justify relative"
        style={{ textAlignLast: "justify" }}
      >
        {props.label}
      </div>
      {props.children}
      {props.message && (
        <span className="absolute ml-[32px] -bottom-[2px] left-1/2 -translate-x-1/2 translate-y-full text-xs text-red-400">
          {props.message}
        </span>
      )}
    </div>
  );
};

export default function ControlPanel({
  onStart, //开始加密
  className, //类名
  pluginList, //插件列表
  disabled, //是否正在加密
  onClearUpload, //清除上传文件
  onClearOutput, //清除输出文件
}: {
  onStart?: (option: ControlOptionType) => void;
  className?: string;
  pluginList: Plugin[];
  disabled?: boolean;
  onClearUpload?: () => void;
  onClearOutput?: () => void;
}) {
  //插件索引
  const [pluginIndex, setPluginIndex] = useState<number>(0);
  //选项卡名称
  const [optionName, setOptionName] = useState<"encrypt" | "decrypt">(
    "encrypt"
  );
  //密钥
  const [key, setKey] = useState<string>("");
  //密钥错误信息
  const [keyErrorMessage, setKeyErrorMessage] = useState<string>("");
  //图像格式索引
  const [formatIndex, setFormatIndex] = useState<number>(0);
  //图片质量
  const [quality, setQuality] = useState(100);
  //是否禁用图像质量
  const [isQualityDisabled, setIsQualityDisabled] = useState(false);
  /**
   * 校验输入密钥
   */
  const validateKey = (key: string, keyRule?: Plugin["keyRule"] | null) => {
    if (keyRule?.required && key === "") {
      setKeyErrorMessage("秘钥不能为空");
      return false;
    } else if (
      keyRule?.required &&
      keyRule?.regex &&
      !new RegExp(keyRule.regex).test(key)
    ) {
      setKeyErrorMessage(keyRule.message);
      return false;
    }
    setKeyErrorMessage("");
    return true;
  };
  /**
   * 开始加密
   */
  const handleStart = () => {
    //校验密钥
    const plugin = pluginList[pluginIndex];
    if (!validateKey(key, plugin.keyRule)) {
      return;
    }
    onStart?.({
      pluginName: plugin.name,
      optionName,
      key,
      format: IMAGE_FORMATS[formatIndex].value as ImageFormatType,
      quality: quality / 100,
    });
  };

  /**
   * 选择算法插件改变
   * @param pluginName 插件名称
   */
  const handlePluginChange = (index: number) => {
    setPluginIndex(index);
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
  const handleImageFormatChange = (index: number) => {
    setFormatIndex(index);
  };

  /**
   * 密钥改变
   * @param event 事件对象
   */
  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKey(value);
    //校验密钥
    const plugin = pluginList[pluginIndex];
    validateKey(value, plugin?.keyRule);
  };
  /**
   * 清空上传文件
   */
  const handleClearUpload = () => {
    onClearUpload?.();
  };
  /**
   * 清空输出文件
   */
  const handleClearOutput = () => {
    onClearOutput?.();
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
  //图像质量输入框是否禁用
  useEffect(() => {
    const format = IMAGE_FORMATS[formatIndex].value;
    const disabledResult =
      format !== "image/jpeg" && format !== "image/webp" && format !== "";
    if (disabledResult) {
      setQuality(100);
    }
    setIsQualityDisabled(disabledResult);
  }, [formatIndex]);
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
    <div className={`text-gray-600 p-3 ${className ?? ""}`}>
      {/* 算法列表 */}
      <List
        options={pluginList}
        checkedIndex={pluginIndex}
        disabled={disabled}
        onChange={handlePluginChange}
        renderSelected={renderPluginSelected}
        renderList={renderPluginList}
        className="mb-4"
      ></List>

      {/* 选择操作 */}
      <CardSelect
        options={OPTION_CARDS}
        disabled={disabled}
        onChange={handleOptionChange}
        className="mb-4"
      />

      {/* 秘钥 */}
      <Item label="秘钥" message={keyErrorMessage}>
        <input
          type="text"
          value={key}
          disabled={disabled}
          onChange={handleKeyChange}
          className={`${
            disabled ? "!bg-gray-200" : ""
          } bg-gray-50 border flex-1 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
        />
      </Item>

      {/* 文件格式 */}
      <Item label="文件格式">
        <List
          options={IMAGE_FORMATS}
          checkedIndex={formatIndex}
          disabled={disabled}
          onChange={handleImageFormatChange}
          renderSelected={(item) => item.label}
          renderList={(list) => list.label}
          className="flex-1"
          listNumber={3}
        ></List>
      </Item>
      {/* 图像质量 */}
      <Item label="图像质量">
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="100"
            value={quality}
            disabled={disabled || isQualityDisabled}
            onChange={handleQualityChange}
            className="absolute w-[80%]"
          />
          <span className="whitespace-nowrap text-sm ml-1 w-[20%] text-center float-right">
            {qualityLabel}
          </span>
        </div>
      </Item>

      <div className="text-center pt-2">
        <Button
          disabled={disabled}
          onClick={handleClearUpload}
          typeColor="white"
          className="mb-2 mr-2"
        >
          清空上传
        </Button>
        <Button
          disabled={disabled}
          onClick={handleClearOutput}
          typeColor="white"
          className="mb-2 mr-2"
        >
          清空输出
        </Button>
        <Button onClick={handleStart} disabled={disabled} className="mb-2">
          开始{optionName === "encrypt" ? "加密" : "解密"}
        </Button>
      </div>
    </div>
  );
}
