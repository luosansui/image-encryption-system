import React, { useEffect, useMemo, useState } from "react";
import { produce } from "immer";
import ControlPanel from "@/pages/encryption/ControlPanel";
import Upload from "@/components/Upload";
import { FileType } from "@/components/Upload/type";
import ProgressBar from "@/components/ProgressBar";
import OutPut from "./Output";
import TableControl from "./TableControl";

export default function Encryption() {
  const [fileList, setFileList] = useState<FileType[]>([]);
  const [filePair, setFilePair] = useState<[FileType, FileType][]>([]);
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
   * 删除上传文件
   */
  const handleFileListRemove = (revoke: (url: string) => void, md5: string) => {
    const fileIndex = fileList.findIndex((file) => file.md5 === md5);
    if (fileIndex == -1) {
      return;
    }
    const file = fileList[fileIndex];
    revoke(file.src);
    setFileList(
      produce((draft) => {
        draft.splice(fileIndex, 1);
      })
    );
  };
  /**
   * 处理生成结果
   */
  const handleGenerateResult = ([origin, encrypt]: [FileType, FileType]) => {
    setFilePair(
      produce((draft) => {
        draft.push([origin, encrypt]);
      })
    );
  };
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
            fileList={fileList}
            handleGenerateResult={handleGenerateResult}
            className="absolute w-full select-none"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex-1 border-2 rounded-lg overflow-hidden">
          <OutPut pairList={filePair} />
        </div>
        <div
          className={`p-2 mt-3 border-2 border-gray-200 shadow-sm rounded-lg ${
            isProgressShow ? "" : "hidden"
          }`}
        >
          <ProgressBar progress={progress} />
        </div>
      </div>
      <div className="border-2 border-gray-200 rounded-lg p-4">
        <TableControl />
      </div>
    </div>
  );
}
