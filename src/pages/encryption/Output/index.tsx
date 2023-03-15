import React, { Fragment, useState } from "react";
import Table from "@/components/Table";
import { FileType } from "@/components/Upload/type";
import { columns } from "./constant";
import CustomModal from "@/components/CustomModal";
/**
 *
 * @param { src: string } 图片src
 * @returns 图像缩略图
 */
const ImageWrapper = ({
  src,
  onClick,
}: {
  src: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}) => {
  //处理点击事件
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    onClick?.(e);
  };
  return (
    <img
      onClick={handleClick}
      className="w-32 h-32 object-scale-down inline-block cursor-pointer"
      src={src}
    />
  );
};

export default function Output({
  pairList,
}: {
  pairList: [FileType, FileType][];
  className?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editImage, setEditImage] = useState<string | null>(null);

  /**
   * 打开图片裁剪模态框
   */
  const handleOpenModal = (src: string) => {
    setIsModalOpen(true);
    setEditImage(src);
  };
  /**
   * 关闭图片裁剪模态框
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditImage(null);
  };
  /**
   * 生成表格数据
   */
  const generateData = () =>
    Array.from(pairList, ([originFile, encryptFile]) => ({
      id: originFile.md5 + encryptFile.md5,
      origin: (
        <ImageWrapper
          src={originFile.src}
          onClick={() => handleOpenModal(originFile.src)}
        />
      ),
      current: (
        <ImageWrapper
          src={encryptFile.src}
          onClick={() => handleOpenModal(encryptFile.src)}
        />
      ),
      currentResolution: 123,
      operate: 123,
    }));

  return (
    <Fragment>
      <div className="relative w-full h-full">
        <div className="absolute w-full h-full overflow-y-auto">
          <Table columns={columns} data={generateData()}></Table>
        </div>
      </div>
      <CustomModal
        isOpen={isModalOpen}
        className="w-full h-full flex justify-center items-center overflow-auto"
      >
        {editImage && <img src={editImage} className="pointer-events-none" />}
        <button
          className="text-black fixed top-3 right-3"
          onClick={handleCloseModal}
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
      </CustomModal>
    </Fragment>
  );
}
