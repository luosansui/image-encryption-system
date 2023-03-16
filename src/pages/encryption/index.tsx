import React, { useEffect, useMemo, useRef, useState } from "react";
import { produce } from "immer";
import ControlPanel from "@/pages/encryption/ControlPanel";
import Upload from "@/components/Upload";
import { FileType } from "@/components/Upload/type";
import ProgressBar from "@/components/ProgressBar";
import OutPut from "./Output";
import TableControl from "./TableControl";
import { ControlOptionType } from "./ControlPanel/type";
import ImageService from "@/service/image";
import { Plugin } from "@/service/plugin/type";

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
   * 保持上传文件和生成文件一致
   */
  /**
   * 处理生成结果
   */
  // const handleGenerateResult = ([origin, encrypt]: [FileType, FileType]) => {
  //   setFilePair(
  //     produce((draft) => {
  //       draft.push([origin, encrypt]);
  //     })
  //   );
  // };
  /**
   * 当前进度
   */
  const progress = useMemo(() => {
    return filePair.length / fileList.length;
  }, [filePair.length, fileList.length]);
  /**
   * 进度条是否显示
   */
  const isProgressShow = useMemo(() => progress > 0, [progress]);
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
    //如果有全是新上传的文件，清空生成列表
    // if (progress === 1) {
    //   setFilePair([]);
    // }
    try {
      //获取结果
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
    /*  //已处理个数
      let doneCount = 0;
      //处理加密结果
      resList.forEach(async (promisePair) => {
        const pair = await promisePair;
        if (++doneCount === fileList.length) {
          setIsEncrypting(false);
        }
        //handleGenerateResult?.(pair);
      }); */
  };
  return (
    <div className="h-full grid grid-rows-2 grid-cols-[minmax(300px,auto)_minmax(300px,400px)] gap-3">
      <div className="border-2 border-gray-200 rounded-lg p-2">
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
          <Upload
            className="absolute w-full select-none"
            list={fileList}
            onAdd={handleFileListAdd}
            onRemove={handleFileListRemove}
          ></Upload>
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
          className={`p-2 mt-3 border-2 border-gray-200 shadow-sm rounded-lg ${
            isProgressShow ? "" : "hidden"
          }`}
        >
          <ProgressBar progress={progress} />
        </div>
      </div>
      {/* <div className="border-2 border-gray-200 rounded-lg p-4">
        <TableControl />
      </div> */}
    </div>
  );
}
