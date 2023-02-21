import ControlPanel from "@/components/ControlPanel";
import Upload from "@/components/Upload";
import { useState } from "react";
import { FileType } from "@/type/file";

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
        <div className="flex-1 p-2 border-2 border-gray-200 rounded-lg overflow-y-auto overflow-x-hidden">
          <Upload className="" onChange={handleFileListChange}></Upload>
        </div>

        <div className="flex-1 p-2 mt-3 mb-3 border-2 border-gray-200 rounded-lg overflow-y-auto overflow-x-hidden">
          <Upload className="" onChange={handleFileListChange}></Upload>
        </div>
        <div className="h-fit p-2 border-2 border-gray-200 shadow-sm rounded-lg">
          进度条
        </div>
      </div>
      {/* <div className="flex-1 h-fit  "> */}
      {/* 上传区 */}
      {/* 
      </div> */}
      <div className="w-1/6 h-full min-w-fit ml-4 p-2 border-2 border-gray-200 rounded-lg">
        {/* 控制区 */}
        <ControlPanel />
      </div>
    </div>
  );
}
