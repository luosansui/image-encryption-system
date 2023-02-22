import ControlPanel from "@/pages/encryption/ControlPanel";
import Upload from "@/components/Upload";
import { useState } from "react";
import { FileType } from "@/components/Upload/type";
import ProgressBar from "@/components/ProgressBar";
import OutPut from "./Output";
export default function Encryption() {
  const [fileList, setFileList] = useState<FileType[]>([]);

  /**
   * 处理上传列表变更
   */
  const handleFileListChange = (files: FileType[]) => {
    console.log("files", files);
    setFileList(files);
  };
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-2 border-2 border-gray-200 rounded-lg">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
            <Upload
              className="absolute w-full select-none"
              onChange={handleFileListChange}
            ></Upload>
          </div>
        </div>
        <div className="flex-1 p-2 mt-3 mb-3 border-2 border-gray-200 rounded-lg overflow-y-auto overflow-x-hidden">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
            <OutPut className="absolute w-full h-full select-none" />
          </div>
        </div>
        <div className="p-2 border-2 border-gray-200 shadow-sm rounded-lg">
          <ProgressBar progress={70} />
        </div>
      </div>
      <div className="w-1/5 h-full min-w-fit ml-4 p-2 border-2 border-gray-200 rounded-lg">
        {/* 控制区 */}
        <ControlPanel />
      </div>
    </div>
  );
}
