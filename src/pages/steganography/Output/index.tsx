import React, { Fragment, useState } from "react";
import Table from "@/components/Table";
import { FileType } from "@/components/Upload/type";
import { columns } from "./constant";
import CustomModal from "@/components/CustomModal";
import { getCompressionRate } from "@/utils/file";
import { ReactComponent as SVG_delete } from "@/assets/svg/delete.svg";
import { Thumbnail } from "@/components/Thumbnail";
import saveAs from "file-saver";
import { formatSize } from "@/utils/number";

export default function Output({
  pairList,
  className,
  disabled,
  onRemove,
}: {
  pairList: [FileType, FileType, string][];
  className?: string;
  disabled?: boolean;
  onRemove?: (md5: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editImage, setEditImage] = useState<{
    src: string;
    name: string;
  } | null>(null);
  /**
   * 打开图片模态框
   */
  const handleOpenModal = (src: string, name: string) => {
    setIsModalOpen(true);
    setEditImage({
      src,
      name,
    });
  };
  /**
   * 关闭图片模态框
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditImage(null);
  };
  /**
   * 删除图像
   */
  const handleRemove = (md5: string) => {
    if (disabled) {
      return;
    }
    onRemove?.(md5);
  };
  /**
   * 下载图像
   */
  const handleDown = ({ file }: FileType) => {
    if (disabled) {
      return;
    }
    saveAs(file, file.name);
  };

  /**
   * 生成表格数据
   */
  const generateData = () =>
    Array.from(pairList, ([originFile, encryptFile, payload]) => {
      const id = originFile.md5;
      const image = (
        <Thumbnail
          file={encryptFile}
          onClick={() =>
            handleOpenModal(encryptFile.src, encryptFile.file.name)
          }
        />
      );
      const originSize = formatSize(originFile.file.size, "MB");
      const currentSize = formatSize(encryptFile.file.size, "MB");
      const compressionRatio = getCompressionRate(
        originFile.file,
        encryptFile.file
      );
      const operate = (
        <div>
          <span
            onClick={() => handleDown(encryptFile)}
            className="cursor-pointer select-none text-blue-500 font-semibold text-sm underline underline-offset-2 mx-2"
          >
            下载
          </span>
          <span
            onClick={() => handleRemove(originFile.md5)}
            className="cursor-pointer select-none text-red-500 font-semibold text-sm underline underline-offset-2 mx-2"
          >
            删除
          </span>
        </div>
      );
      return {
        id,
        image,
        originSize,
        currentSize,
        compressionRatio: (
          <span
            className={`${
              compressionRatio > 100 ? "text-red-500" : "text-green-500"
            }`}
          >
            {compressionRatio}%
          </span>
        ),
        message: (
          <div className="max-w-sm max-h-40 whitespace-normal break-words overflow-y-auto overflow-x-hidden">
            {payload}
          </div>
        ),
        operate,
      };
    });

  return (
    <Fragment>
      <div className={`relative w-full h-full ${className ?? ""}`}>
        <div className="absolute w-full h-full overflow-y-auto">
          <Table columns={columns} data={generateData()}></Table>
        </div>
      </div>
      <CustomModal
        isOpen={isModalOpen}
        className="w-full h-full flex justify-center items-center relative"
      >
        <div className="w-full h-full overflow-auto p-6 flex">
          {editImage && (
            <a
              href={editImage?.src}
              download={editImage?.name}
              className="m-auto"
              onClick={(e) => e.preventDefault()}
            >
              <img
                src={editImage?.src}
                style={{
                  backgroundImage: `linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%),
                linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%)`,
                  backgroundSize: "40px 40px",
                  backgroundPosition: "0 0, 20px 20px",
                }}
              />
            </a>
          )}
        </div>

        <button
          className="text-black fixed top-3 right-3"
          onClick={handleCloseModal}
        >
          <SVG_delete />
        </button>
      </CustomModal>
    </Fragment>
  );
}
