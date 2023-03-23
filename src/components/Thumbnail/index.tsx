import React from "react";
import { FileType } from "../Upload/type";

export const Thumbnail = ({
  file,
  onClick,
}: {
  file: FileType;
  onClick?: () => void;
}) => {
  //阻止默认事件
  const handlePreventDefault = (event: React.MouseEvent) => {
    event.preventDefault();
  };
  //处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    handlePreventDefault(event);
    onClick?.();
  };
  return (
    <a
      href={file.thumbnail.src}
      download={`thumbnail-${file.thumbnail.file.name}`}
      className="inline-block h-full"
      onClick={handlePreventDefault}
    >
      <img
        src={file.thumbnail.src}
        onClick={handleClick}
        className="object-scale-down inline-block cursor-pointer bg-gray-100 rounded w-32 h-32"
      />
    </a>
  );
};
