import React, { useEffect, useMemo, useRef, useState } from "react";
import { produce } from "immer";
import ControlPanel from "./ControlPanel";
import Upload from "@/components/Upload";
import { FileType } from "@/components/Upload/type";
import ProgressBar from "@/components/ProgressBar";
import OutPut from "./Output";
import { ControlOptionType } from "./ControlPanel/type";
import ImageService from "@/service/image";
import { Plugin } from "@/service/plugin/type";
import { ReactComponent as SVG_download } from "@/assets/svg/download.svg";
import { progressStatus } from "@/service/image/type";
import { multipleFileDownload } from "@/utils/zip";

export default function Encryption() {
  //文件列表
  const [fileList, setFileList] = useState<FileType[]>([]);
  //生成列表(两个顺序一致)
  const [filePair, setFilePair] = useState<[FileType, FileType][]>([]);
  //插件列表
  const [pluginList, setPluginList] = useState<Plugin[]>([]);
  //图片服务
  const imageService = useRef<ImageService | null>(null);
  //是否正在加密
  const [isEncrypting, setIsEncrypting] = useState(false);
  //是否正在导出
  const [isExporting, setIsExporting] = useState(false);
  //是否正在上传
  const [isUploading, setIsUploading] = useState(false);
  //描述过程信息
  const [processMessage, setProcessMessage] = useState("");
  //进度条颜色
  const [processColor, setProcessColor] = useState<"blue" | "red">("blue");

  /**
   * 新增上传文件
   */
  const handleFileListAdd = (files: FileType[], insertIndex: number) => {
    setFileList(
      produce((draftState) => {
        draftState.splice(insertIndex, 0, ...files);
      })
    );
  };
  /**
   * 删除生成文件
   */
  const handleFilePairRemove = (md5: string) => {
    const pairIndex = filePair.findIndex((pair) => pair[0].md5 === md5);
    if (pairIndex == -1) {
      return;
    }
    setProcessMessage("");
    setProcessColor("blue");
    //删除生成列表中的文件
    const pair = filePair[pairIndex];
    if (pair) {
      URL.revokeObjectURL(pair[1].src);
      URL.revokeObjectURL(pair[1].thumbnail.src);
      setFilePair(
        produce((draft) => {
          draft.splice(pairIndex, 1);
        })
      );
    }
  };
  /**
   * 删除上传文件
   */
  const handleFileListRemove = (md5: string) => {
    const fileIndex = fileList.findIndex((file) => file.md5 === md5);
    if (fileIndex == -1) {
      return;
    }
    //删除上传列表中的文件
    const file = fileList[fileIndex];
    URL.revokeObjectURL(file.src);
    URL.revokeObjectURL(file.thumbnail.src);
    setFileList(
      produce((draft) => {
        draft.splice(fileIndex, 1);
      })
    );
    handleFilePairRemove(md5);
  };
  /**
   * 清空上传文件
   */
  const handleClearUpload = () => {
    for (const file of fileList) {
      URL.revokeObjectURL(file.src);
      URL.revokeObjectURL(file.thumbnail.src);
    }
    setFileList([]);
    //同时清空输出文件
    handleClearOutput();
  };
  /**
   * 清空生成文件
   */
  const handleClearOutput = () => {
    for (const pair of filePair) {
      URL.revokeObjectURL(pair[1].src);
      URL.revokeObjectURL(pair[1].thumbnail.src);
    }
    setFilePair([]);
    setProcessMessage("");
    setProcessColor("blue");
  };
  /**
   * 上传状态改变
   */
  const handleUploadStateChange = (status: boolean) => {
    setIsUploading(status);
  };
  /**
   * 初始化图片服务
   */
  const initImageService = async () => {
    try {
      imageService.current = new ImageService();
      await imageService.current.initService("encryption");
      const plugins = imageService.current.getPlugins();
      console.log("plugins", plugins);
      if (plugins.length) {
        setPluginList(plugins);
      }
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * 载入图片业务
   */
  useEffect(() => {
    initImageService();
    return () => {
      imageService.current = null;
    };
  }, []);

  /**
   * 开始加密
   */
  const handleStart = async (options: ControlOptionType) => {
    if (!fileList.length || !imageService.current) {
      return;
    }
    //开始加密
    setIsEncrypting(true);
    setFilePair([]);
    setProcessColor("blue");
    try {
      //获取结果
      console.log("options", options);
      //处理过程信息
      const progress = (status: progressStatus) => {
        setProcessMessage(status.message);
        if (status.done && status.error) {
          setProcessColor("red");
        }
      };
      const resList = imageService.current.processing(
        fileList,
        options,
        "encryption",
        progress
      );
      //处理加密结果
      for await (const item of resList) {
        if (!item) {
          continue;
        }
        setFilePair(
          produce((draft) => {
            draft.push([item[0], item[1]]);
          })
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEncrypting(false);
    }
  };
  /**
   * 下载结果
   */
  const handleDownload = async () => {
    // 如果正在进行加密或者导出则不允许下载
    if (isEncrypting || isExporting || !filePair.length) {
      return;
    }
    setIsExporting(true);

    try {
      const files = filePair.map(([, { file }]) => file);
      await multipleFileDownload(files, "encrypted-images");
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  //是否正在执行某项操作
  const isOperating = useMemo(
    () => isEncrypting || isExporting || isUploading,
    [isEncrypting, isExporting, isUploading]
  );

  // 进度条是否显示
  const isProgressShow = useMemo(
    () => isEncrypting || filePair.length / fileList.length > 0,
    [fileList.length, filePair.length, isEncrypting]
  );
  return (
    <div className="w-full h-full overflow-auto">
      <div className="h-full grid grid-rows-[55%_calc(45% - 0.75rem)] grid-cols-[minmax(300px,auto)_minmax(300px,400px)] gap-3">
        <div className="border-2 border-gray-200 rounded-lg p-2">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
            <Upload
              className="absolute w-full select-none"
              list={fileList}
              onAdd={handleFileListAdd}
              onRemove={handleFileListRemove}
              disabled={isOperating}
              onUploadStateChange={handleUploadStateChange}
            />
          </div>
        </div>
        <div className="border-2 border-gray-200 rounded-lg p-2">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
            <ControlPanel
              onStart={handleStart}
              onClearUpload={handleClearUpload}
              onClearOutput={handleClearOutput}
              pluginList={pluginList}
              className="absolute w-full select-none"
              disabled={isOperating}
            />
          </div>
        </div>
        <div className="flex flex-col col-span-2">
          <div className="flex-1 border-2 rounded-lg overflow-hidden">
            <OutPut
              pairList={filePair}
              onRemove={handleFilePairRemove}
              disabled={isOperating}
            />
          </div>
          <div
            className={`mt-3 flex items-center ${
              isProgressShow ? "" : "hidden"
            }`}
          >
            <div className="p-2 border-2 border-gray-200 shadow-sm rounded-lg flex-1 relative">
              <span className="absolute z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 select-none">
                {processMessage}
              </span>
              <ProgressBar
                current={filePair.length}
                total={fileList.length}
                type="fraction"
                color={processColor}
              />
            </div>
            <div
              onClick={handleDownload}
              className={`p-2 border-2 border-gray-200 shadow-sm rounded-lg ml-2 hover:bg-gray-200 ${
                isOperating ? "!bg-gray-100" : ""
              }`}
            >
              <SVG_download
                fill={isOperating ? "#ccc" : "#000"}
                className="w-4 h-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
