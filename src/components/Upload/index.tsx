import { calculateMD5, file2FileType } from "@/utils/file";
import React, { Fragment, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import pLimit from "p-limit";
import { produce } from "immer";
import { FileType } from "@/components/Upload/type";
import ImageCrop from "../ImageCrop";
import { ReactComponent as SVG_plus } from "@/assets/svg/plus.svg";
import { ReactComponent as SVG_delete } from "@/assets/svg/delete.svg";
import { Thumbnail } from "../Thumbnail";

const Upload: React.FC<{
  list?: FileType[];
  disabled?: boolean;
  className?: string;
  onAdd?: (files: FileType[], insertIndex: number) => void;
  onRemove?: (md5: string) => void;
  onUploadStateChange?: (status: boolean) => void;
}> = ({ list, disabled, className, onAdd, onRemove, onUploadStateChange }) => {
  const [files, setFiles] = useState<FileType[]>(list || []);
  //打开图片裁剪模态框
  const [isModalOpen, setIsModalOpen] = useState(false);
  //要编辑的图片
  const [editImageFile, setEditImageFile] = useState<FileType | null>(null);
  //当外部传入的list时，该组件为受控组件
  useEffect(() => {
    if (list !== undefined) {
      setFiles(list);
    }
  }, [list]);

  /**
   * 过滤重复文件
   * @param fileList 文件列表
   * @param acceptedMD5s 已经计算的md5列表，用于优化性能
   * @returns 不重复的文件列表
   */
  const filterDuplicateFiles = (
    fileList: File[],
    acceptedMD5s: string[]
  ): Promise<FileType | null>[] => {
    //限制并发数为3
    const limit = pLimit(3);
    //记录当前文件的md5
    const fileHashSet = new Set<string>(files.map((file) => file.md5));
    //过滤重复文件
    const noDuplicateList = fileList.map(async (file, index) => {
      const newFile = await limit(() =>
        file2FileType(file, acceptedMD5s[index])
      );
      if (!fileHashSet.has(newFile.md5)) {
        fileHashSet.add(newFile.md5);
        return newFile;
      }
      return null;
    });
    return noDuplicateList;
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    if (disabled) {
      return;
    }
    onUploadStateChange?.(true);
    await handleAdd(acceptedFiles);
    onUploadStateChange?.(false);
  };

  const handleAdd = async (
    acceptedFiles: File[],
    acceptedMD5s: string[] = [],
    insertIndex = files.length
  ) => {
    if (disabled) {
      return;
    }
    //过滤重复文件
    const promiseFiles = filterDuplicateFiles(acceptedFiles, acceptedMD5s);
    //等待文件计算MD5完成
    for (let i = 0; i < promiseFiles.length; i += 3) {
      //每次处理3个
      const result = await Promise.all(promiseFiles.slice(i, i + 3));
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
  };

  const handleRemove = (md5: string) => {
    if (disabled) {
      return;
    }
    //当外部没有传入的list时，该组件为非受控组件，直接更新状态
    if (list === undefined) {
      const fileIndex = files.findIndex((file) => file.md5 === md5);
      if (fileIndex !== -1) {
        const file = files[fileIndex];
        URL.revokeObjectURL(file.src);
        URL.revokeObjectURL(file.thumbnail.src);
        console.log("[[非受控组件]]: Remove File");
        setFiles(
          produce((draft) => {
            draft.splice(fileIndex, 1);
          })
        );
      }
    }
    //通知外部变更
    onRemove?.(md5);
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
    if (disabled) {
      return;
    }
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
        <Dropzone onDrop={handleDrop} disabled={disabled}>
          {({ getRootProps, getInputProps }) => (
            <div className="sticky top-0 p-2 box-border w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-[12.5%]">
              <div
                className="h-32 p-2 border-2 border-dashed border-gray-400 rounded cursor-pointer select-none flex justify-center items-center"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <SVG_plus className="h-10 w-10 text-gray-600" />
              </div>
            </div>
          )}
        </Dropzone>
        {files.map((file) => (
          <div
            key={file.md5}
            className="p-2 box-border relative w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-[12.5%]"
          >
            <Thumbnail file={file} onClick={() => handleOpenModal(file)} />

            <button
              className="text-black absolute top-0 right-0"
              onClick={() => handleRemove(file.md5)}
            >
              <SVG_delete />
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
