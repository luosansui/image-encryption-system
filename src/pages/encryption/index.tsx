import { useMemo, useState } from "react";
import { produce } from "immer";
import ControlPanel from "@/pages/encryption/ControlPanel";
import Upload from "@/components/Upload";
import { FileType } from "@/components/Upload/type";
import ProgressBar from "@/components/ProgressBar";
import OutPut from "./Output";

export default function Encryption() {
  const [fileList, setFileList] = useState<FileType[]>([]);
  const [filePair, setFilePair] = useState<[FileType, FileType][]>([]);
  /**
   * 处理上传列表变更
   */
  const handleFileListChange = (files: FileType[]) => {
    console.log("files", files);
    setFileList(files);
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
    <div className="flex h-full">
      <div className="min-w-[300px] flex-1 flex flex-col">
        <div className="flex-1 p-2 border-2 border-gray-200 rounded-lg">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
            <Upload
              className="absolute w-full select-none"
              onChange={handleFileListChange}
            ></Upload>
          </div>
        </div>
        <div className="flex-1 p-2 mt-3 border-2 border-gray-200 rounded-lg overflow-y-auto overflow-x-hidden">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
            <OutPut
              pairList={filePair}
              className="absolute w-full h-full select-none"
            />
          </div>
        </div>
        <div
          className={`p-2 mt-3 border-2 border-gray-200 shadow-sm rounded-lg ${
            isProgressShow ? "" : "hidden"
          }`}
        >
          <ProgressBar progress={progress} />
        </div>
      </div>
      <div className="min-w-[300px] h-full  ml-4 p-2 border-2 border-gray-200 rounded-lg">
        {/* 控制区 */}
        <ControlPanel
          fileList={fileList}
          handleGenerateResult={handleGenerateResult}
        />
      </div>
    </div>
  );
}
