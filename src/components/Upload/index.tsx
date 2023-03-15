import { calculateMD5 } from "@/utils/file";
import React, { Fragment, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import pLimit from "p-limit";
import { produce } from "immer";
import { FileType } from "@/components/Upload/type";
import ImageCrop from "../ImageCrop";

const Upload: React.FC<{
  list?: FileType[];
  onAdd?: (files: FileType[], insertIndex: number) => void;
  onRemove?: (revoke: (url: string) => void, md5: string) => void; //第一个参数revoke是为了显式的告诉外部需要释放url资源
  className?: string;
}> = ({ list, onAdd, onRemove, className }) => {
  const [files, setFiles] = useState<FileType[]>(list || []);
  //保存当前文件的MD5集合，用于过滤重复文件
  const fileHashSet = useRef(new Set<string>());
  //打开图片裁剪模态框
  const [isModalOpen, setIsModalOpen] = useState(false);
  //要编辑的图片
  const [editImageFile, setEditImageFile] = useState<FileType | null>(null);
  //是否正在上传
  const [isUploading, setIsUploading] = useState(false);
  //当外部传入的list时，该组件为受控组件
  useEffect(() => {
    if (list !== undefined) {
      setFiles(list);
    }
  }, [list]);

  /**
   * 过滤重复文件
   * @param files 文件列表
   * @param acceptedMD5s 已经计算的md5列表
   * @returns 不重复的文件列表
   */
  const filterDuplicateFiles = (
    fileList: File[],
    acceptedMD5s: string[]
  ): Promise<FileType | null>[] => {
    const limit = pLimit(3);
    return fileList.map(async (file, index) => {
      try {
        const md5 =
          acceptedMD5s[index] ?? (await limit(() => calculateMD5(file)));
        if (!fileHashSet.current.has(md5)) {
          fileHashSet.current.add(md5);
          const src = URL.createObjectURL(file);
          return { file, md5, src };
        }
      } catch (error) {
        console.error(error);
      }
      return null;
    });
  };

  const handleDrop = (acceptedFiles: File[]) => {
    handleAdd(acceptedFiles);
  };

  const handleAdd = async (
    acceptedFiles: File[],
    acceptedMD5s: string[] = [],
    insertIndex = files.length
  ) => {
    setIsUploading(true);
    //过滤重复文件
    const newFiles = filterDuplicateFiles(acceptedFiles, acceptedMD5s);
    //等待文件计算MD5完成
    for (let i = 0; i < newFiles.length; i += 3) {
      const result = await Promise.all(newFiles.slice(i, i + 3));
      //过滤掉重复文件
      const resultWithoutNull = result.filter(
        (item): item is FileType => item !== null
      );
      if (resultWithoutNull.length > 0) {
        //当外部没有传入的list时，该组件为非受控组件，直接更新状态
        if (list === undefined) {
          console.log("[[非受控组件]]: Add File");
          setFiles(
            produce((draftState) => {
              draftState.splice(insertIndex + i, 0, ...resultWithoutNull);
            })
          );
        } else {
          //通知外部变更
          onAdd?.(resultWithoutNull, insertIndex + i);
        }
      }
    }
    setIsUploading(false);
  };

  const handleRemove = (md5: string) => {
    //从fileHashSet中移除
    fileHashSet.current.delete(md5);
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
  /**
   * 图片裁剪模态框关闭回调
   */
  const handleImageCropChange = async (cropFile: File, originMD5: string) => {
    const md5 = await calculateMD5(cropFile);
    if (md5 === originMD5) {
      return;
    }
    const index = files.findIndex((file) => file.md5 === originMD5);
    handleRemove(originMD5);
    handleAdd([cropFile], [md5], index);
  };

  /**
   * 打开图片裁剪模态框
   */
  const handleOpenModal = (image: FileType) => {
    setIsModalOpen(true);
    setEditImageFile(image);
  };
  /**
   * 关闭图片裁剪模态框
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditImageFile(null);
  };
  return (
    <Fragment>
      <div className={`flex flex-wrap ${className ?? ""}`}>
        <Dropzone onDrop={handleDrop} disabled={isUploading}>
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
        {files.map((file) => (
          <div
            key={file.md5}
            className="p-2 box-border relative w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-[12.5%]"
          >
            <img
              src={file.src}
              alt={file.file.name}
              onClick={() => handleOpenModal(file)}
              className="w-full h-32 object-cover rounded border border-gray-200 cursor-pointer"
            />
            <button
              className="text-black absolute top-0 right-0"
              onClick={() => handleRemove(file.md5)}
            >
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
              >
                <path
                  d="M512 512m-460.8 0a460.8 460.8 0 1 0 921.6 0 460.8 460.8 0 1 0-921.6 0Z"
                  fill="#E73A30"
                ></path>
                <path
                  d="M584.3968 512l108.6464 108.5952a51.2 51.2 0 0 1-72.448 72.448L512 584.3968l-108.5952 108.6464a51.2 51.2 0 1 1-72.448-72.448L439.6032 512 330.9568 403.4048A51.2 51.2 0 0 1 403.456 330.9568L512 439.6032l108.5952-108.6464a51.2 51.2 0 0 1 72.448 72.448L584.3968 512z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
      <ImageCrop
        imageFile={editImageFile}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onChange={handleImageCropChange}
      />
    </Fragment>
  );
};

export default Upload;
