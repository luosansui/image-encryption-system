import { calculateMD5 } from "@/utils/file";
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import pLimit from "p-limit";
import { produce } from "immer";
import { FileType } from "@/components/Upload/type";

const Upload: React.FC<{
  list?: FileType[];
  onAdd?: (files: FileType[]) => void;
  onRemove?: (revoke: (url: string) => void, md5: string) => void; //第一个参数revoke是为了显式的告诉外部需要释放url资源
  className?: string;
}> = ({ list, onAdd, onRemove, className }) => {
  const [files, setFiles] = useState<FileType[]>(list || []);

  //当外部传入的list时，该组件为受控组件
  useEffect(() => {
    if (list !== undefined) {
      setFiles(list);
    }
  }, [list]);

  /**
   * 过滤重复文件
   * @param files 文件列表
   * @returns 不重复的文件列表
   */
  async function filterDuplicateFiles(fileList: File[]) {
    const limit = pLimit(3);
    const uniqueFiles: FileType[] = [];
    //当前所有文件的md5集合
    const fileHashSet = new Set(files.map((file) => file.md5));
    await Promise.all(
      fileList.map(async (file) => {
        try {
          const md5 = await limit(() => calculateMD5(file));
          if (!fileHashSet.has(md5)) {
            fileHashSet.add(md5);
            const src = URL.createObjectURL(file);
            uniqueFiles.push({ file, md5, src });
          }
        } catch (error) {
          console.error(error);
        }
      })
    );
    return uniqueFiles;
  }

  const handleDrop = async (acceptedFiles: File[]) => {
    const newFiles = await filterDuplicateFiles(acceptedFiles);
    //当外部没有传入的list时，该组件为非受控组件，直接更新状态
    if (list === undefined) {
      setFiles(
        produce((draftState) => {
          draftState.push(...newFiles);
        })
      );
    }
    //通知外部变更
    onAdd?.(newFiles);
  };

  const handleRemove = (md5: string) => {
    //当外部没有传入的list时，该组件为非受控组件，直接更新状态
    if (list === undefined) {
      const fileIndex = files.findIndex((file) => file.md5 === md5);
      if (fileIndex !== -1) {
        const file = files[fileIndex];
        URL.revokeObjectURL(file.src);
        console.log("[[非受控组件]]: Remove File");
        setFiles(
          produce((draft) => {
            draft.splice(fileIndex, 1);
          })
        );
      }
    }
    //通知外部变更
    onRemove?.(URL.revokeObjectURL, md5);
  };

  return (
    <div className={`flex flex-wrap ${className ?? ""}`}>
      <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <div className="sticky top-0 p-2 box-border w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-[12.5%]">
            <div
              className="h-32 p-2 border-2 border-dashed border-gray-400 rounded cursor-pointer select-none flex justify-center items-center"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <svg
                className="h-10 w-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </div>
        )}
      </Dropzone>
      {files.map((FileType) => (
        <div
          key={FileType.md5}
          className="p-2 box-border relative w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-[12.5%]"
        >
          <img
            src={FileType.src}
            alt={FileType.file.name}
            className="w-full h-32 object-cover rounded border border-gray-200"
          />
          <button
            className="text-black absolute top-0 right-0"
            onClick={() => handleRemove(FileType.md5)}
          >
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="902"
              width="24"
              height="24"
            >
              <path
                d="M512 512m-460.8 0a460.8 460.8 0 1 0 921.6 0 460.8 460.8 0 1 0-921.6 0Z"
                fill="#E73A30"
                p-id="903"
              ></path>
              <path
                d="M584.3968 512l108.6464 108.5952a51.2 51.2 0 0 1-72.448 72.448L512 584.3968l-108.5952 108.6464a51.2 51.2 0 1 1-72.448-72.448L439.6032 512 330.9568 403.4048A51.2 51.2 0 0 1 403.456 330.9568L512 439.6032l108.5952-108.6464a51.2 51.2 0 0 1 72.448 72.448L584.3968 512z"
                fill="#FFFFFF"
                p-id="904"
              ></path>
            </svg>
          </button>
        </div>
      ))}
      {/* <div className="absolute -bottom-2 left-2 text-xs font-semibold text-gray-600">
        {files.length ? `共${files.length}张图片` : null}
      </div> */}
    </div>
  );
};

export default Upload;
