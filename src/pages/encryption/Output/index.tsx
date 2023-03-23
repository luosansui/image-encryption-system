import React, { Fragment, useState } from "react";
import Table from "@/components/Table";
import { FileType } from "@/components/Upload/type";
import { columns } from "./constant";
import CustomModal from "@/components/CustomModal";
import { getCompressionRate } from "@/utils/file";
import { ReactComponent as SVG_delete } from "@/assets/svg/delete.svg";
/**
 *
 * @param { src: string, name:string } 图片src
 * @returns 图像缩略图
 */
const ImageWrapper = ({
  file,
  onClick,
}: {
  file: FileType;
  onClick?: () => void;
}) => {
  //处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    onClick?.();
  };
  return (
    <a
      href={file.thumbnail.src}
      download={`thumbnail-${file.thumbnail.file.name}`}
      className="inline-block"
    >
      <img
        src={file.thumbnail.src}
        onClick={handleClick}
        className="w-32 h-32 object-scale-down inline-block cursor-pointer bg-gray-100"
      />
    </a>
  );
};

export default function Output({
  pairList,
  className,
  onRemove,
}: {
  pairList: [FileType, FileType][];
  className?: string;
  onRemove?: (md5: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editImage, setEditImage] = useState<{
    src: string;
    name: string;
  } | null>(null);
  /**
   * 打开图片裁剪模态框
   */
  const handleOpenModal = (src: string, name: string) => {
    setIsModalOpen(true);
    setEditImage({
      src,
      name,
    });
  };
  /**
   * 关闭图片裁剪模态框
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditImage(null);
  };
  /**
   * 删除图像
   */
  const handleRemove = (md5: string) => {
    onRemove?.(md5);
  };
  /**
   * 生成表格数据
   */
  const generateData = () =>
    Array.from(pairList, ([originFile, encryptFile]) => ({
      id: originFile.md5,
      origin: (
        <ImageWrapper
          file={originFile}
          onClick={() => handleOpenModal(originFile.src, originFile.file.name)}
        />
      ),
      current: (
        <ImageWrapper
          file={encryptFile}
          onClick={() =>
            handleOpenModal(encryptFile.src, encryptFile.file.name)
          }
        />
      ),
      compressionRatio: getCompressionRate(originFile.file, encryptFile.file),
      operate: (
        <span
          onClick={() => handleRemove(originFile.md5)}
          className="cursor-pointer select-none text-red-400 font-semibold text-sm underline underline-offset-2"
        >
          删除
        </span>
      ),
    }));

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
