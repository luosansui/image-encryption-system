import React, { useEffect, useMemo, useRef, useState } from "react";
import { produce } from "immer";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import ControlPanel from "@/pages/encryption/ControlPanel";
import Upload from "@/components/Upload";
import { FileType } from "@/components/Upload/type";
import ProgressBar from "@/components/ProgressBar";
import OutPut from "./Output";
import { ControlOptionType } from "./ControlPanel/type";
import ImageService from "@/service/image";
import { Plugin } from "@/service/plugin/type";
import { ReactComponent as SVG_download } from "@/assets/svg/download.svg";

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
  useEffect(() => {
    console.log("filePair", filePair);
  }, [filePair]);
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
  const handleFilePairRemove = (revoke: (url: string) => void, md5: string) => {
    const pairIndex = filePair.findIndex((pair) => pair[0].md5 === md5);
    if (pairIndex == -1) {
      return;
    }
    //删除生成列表中的文件
    const pair = filePair[pairIndex];
    if (pair) {
      revoke(pair[1].src);
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
  const handleFileListRemove = (revoke: (url: string) => void, md5: string) => {
    const fileIndex = fileList.findIndex((file) => file.md5 === md5);
    if (fileIndex == -1) {
      return;
    }
    //删除上传列表中的文件
    const file = fileList[fileIndex];
    revoke(file.src);
    setFileList(
      produce((draft) => {
        draft.splice(fileIndex, 1);
      })
    );
    handleFilePairRemove(revoke, md5);
  };
  /**
   * 初始化图片服务
   */
  const initImageService = async () => {
    try {
      imageService.current = new ImageService();
      await imageService.current.initService();
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
    try {
      //获取结果
      console.log("options", options);
      const resList = imageService.current.processing(fileList, options);
      //处理加密结果
      for await (const item of resList) {
        setFilePair(
          produce((draft) => {
            draft.push(item);
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
      //如果只有一张图片就不打包了
      if (filePair.length === 1) {
        const [_, { file }] = filePair[0];
        saveAs(file, file.name);
      } else {
        const zip = new JSZip();
        //添加文件
        for (const [_, { file }] of filePair) {
          zip.file(file.name, file);
        }
        //获取结果
        const content = await zip.generateAsync({ type: "blob" });
        //保存文件
        saveAs(content, "encrypted-images.zip");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  //是否正在执行某项操作
  const isOperating = useMemo(
    () => isEncrypting || isExporting,
    [isEncrypting, isExporting]
  );

  // 进度条是否显示
  const isProgressShow = useMemo(
    () => filePair.length / fileList.length > 0,
    [fileList.length, filePair.length]
  );
  return (
    <div className="h-full grid grid-rows-2 grid-cols-[minmax(300px,auto)_minmax(300px,400px)] gap-3">
      <div className="border-2 border-gray-200 rounded-lg p-2">
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
          <Upload
            className="absolute w-full select-none"
            list={fileList}
            onAdd={handleFileListAdd}
            onRemove={handleFileListRemove}
          />
        </div>
      </div>
      <div className="border-2 border-gray-200 rounded-lg p-2">
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
          <ControlPanel
            onStart={handleStart}
            pluginList={pluginList}
            className="absolute w-full select-none"
            disabled={isEncrypting}
          />
        </div>
      </div>
      <div className="flex flex-col col-span-2">
        <div className="flex-1 border-2 rounded-lg overflow-hidden">
          <OutPut pairList={filePair} onRemove={handleFilePairRemove} />
        </div>
        <div
          className={`mt-3 flex items-center ${isProgressShow ? "" : "hidden"}`}
        >
          <div className="p-2 border-2 border-gray-200 shadow-sm rounded-lg  flex-1">
            <ProgressBar
              current={filePair.length}
              total={fileList.length}
              type="fraction"
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
  );
}
