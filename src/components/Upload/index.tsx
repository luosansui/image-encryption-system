import { calculateMD5 } from "@/utils/module/file";
import React, { useRef, useState } from "react";
import Dropzone from "react-dropzone";
import pLimit from "p-limit";

export type FileWithMD5 = {
  file: File;
  md5: string;
};

const MultiImageUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const fileHashSet = useRef<Set<string>>(new Set());
  /**
   * 过滤重复文件
   * @param files 文件列表
   * @returns 不重复的文件列表
   */
  async function filterDuplicateFiles(files: File[]) {
    const limit = pLimit(3);
    const uniqueFiles: File[] = [];
    await Promise.all(
      files.map(async (file) => {
        const md5 = await limit(() => calculateMD5(file));
        if (!fileHashSet.current.has(md5)) {
          fileHashSet.current.add(md5);
          uniqueFiles.push(file);
        }
      })
    );
    return uniqueFiles;
  }

  const handleDrop = async (acceptedFiles: File[]) => {
    const newFiles = await filterDuplicateFiles(acceptedFiles);
    setFiles((prevState) => [...prevState, ...newFiles]);
  };

  const handleRemove = (file: File) => {
    setFiles((prevState) => prevState.filter((f) => f !== file));
  };

  return (
    <div className="flex flex-wrap">
      <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <div className="p-2 box-border w-1/3 md:w-1/4 lg:w-1/6 2xl:w-1/12">
            <div
              className="h-32 p-2 border-2 border-dashed border-gray-400 rounded cursor-pointer select-none"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <p>click to select files</p>
            </div>
          </div>
        )}
      </Dropzone>
      {files.map((file, index) => (
        <div
          key={file.name}
          className="p-2 box-border relative w-1/3 md:w-1/4 lg:w-1/6 2xl:w-1/12"
        >
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-32 object-cover rounded"
          />
          <button
            className="text-black absolute -top-1 -right-1"
            onClick={() => handleRemove(file)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M13.414 6.586a2 2 0 112.828 2.828L12.828 10l3.414 3.414a2 2 0 11-2.828 2.828L10 12.828l-3.414 3.414a2 2 0 11-2.828-2.828L7.172 10 3.758 6.586a2 2 0 112.828-2.828L10 7.172l3.414-3.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default MultiImageUpload;
