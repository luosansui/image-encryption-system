import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import ImageCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./index.css";
import Ruler from "../Ruler";
import { FileType } from "../Upload/type";
Modal.setAppElement("#root");

interface ModalContentProps {
  imageFile: FileType | null;
  onClose?: () => void;
  onChange?: (cropFile: File, originMD5: string) => void;
}
interface ImageCropModalProps {
  imageFile: FileType | null;
  isOpen: boolean;
  onClose?: () => void;
  onChange?: (cropFile: File, originMD5: string) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  imageFile,
  onClose,
  onChange,
}) => {
  const initCrop: {
    unit: "%" | "px";
    x: number;
    y: number;
    width: number;
    height: number;
  } = {
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  };
  //预设裁剪范围
  const [crop, setCrop] = useState<Crop>(initCrop);
  //缩放比例
  const [scale, setScale] = useState(1);
  //旋转角度
  const [rotate, setRotate] = useState(0);
  //图片引用
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  /**
   *
   * @param newCrop 新的裁剪范围
   */
  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };
  /**
   * 刻度尺组件回调
   */
  const handleRulerChange = useCallback(
    (values: { scale: number; rotate: number }) => {
      setScale(values.scale);
      setRotate(values.rotate);
    },
    []
  );
  /**
   * 确认裁剪
   */
  const handleConfirm = async () => {
    if (!imageFile || !crop.width || !crop.height) return;

    const offscreenCanvas = new OffscreenCanvas(crop.width, crop.height);
    const ctx = offscreenCanvas.getContext(
      "2d"
    ) as OffscreenCanvasRenderingContext2D;

    if (!ctx) return;
    ctx.translate(crop.width / 2, crop.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    const img = await createImageBitmap(imageFile.file);
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      -crop.width / 2,
      -crop.height / 2,
      crop.width,
      crop.height
    );

    const blob = await (offscreenCanvas as any).convertToBlob({
      type: imageFile.file.type || "image/png",
    });
    const file = new File([blob], imageFile.file.name ?? "image.png", {
      type: blob.type,
    });
    onChange?.(file, imageFile.md5);
    onClose?.();
  };

  //完成裁剪
  const handleCancel = () => {
    onClose?.();
  };
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">裁剪图片</h2>
        <div>
          <button
            className="text-black text-sm hover:bg-gray-200 border border-gray-300 cursor-pointer px-3 py-1 rounded-full mr-3"
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            className="text-white text-sm hover:bg-blue-600 cursor-pointer px-3 py-1 bg-blue-500 rounded-full"
            onClick={handleConfirm}
          >
            完成
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-200 relative">
        <div className="absolute w-full h-full overflow-auto flex">
          <ImageCrop
            crop={crop}
            className="align-bottom m-auto"
            onChange={handleCropChange}
            onComplete={handleCropChange}
            minHeight={10}
            minWidth={10}
          >
            <img
              ref={imageRef}
              src={imageFile?.src}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            />
          </ImageCrop>
        </div>
      </div>

      <div className="my-4">
        <div className="flex flex-col  items-center justify-center">
          <Ruler
            scale={{
              min: 0,
              max: 100,
              defaultValue: 0,
              suffix: "%",
            }}
            rotate={{
              min: -180,
              max: 180,
              defaultValue: 0,
              suffix: "°",
            }}
            onChange={handleRulerChange}
          />
        </div>
      </div>
    </div>
  );
};

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageFile,
  isOpen,
  onClose,
  onChange,
}) => {
  const [isDestroy, setIsDestroy] = useState(false);
  //模态框打开后创建元素
  const handleAfterOpen = () => {
    setIsDestroy(false);
  };
  //模态框关闭后销毁内部元素
  const handleAfterClose = () => {
    setIsDestroy(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      closeTimeoutMS={250}
      onAfterClose={handleAfterClose}
      onAfterOpen={handleAfterOpen}
      contentLabel="Image Crop Modal"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-50 select-none"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-md h-[75%] w-3/4 lg:w-2/3 2xl:w-2/5 outline-none"
    >
      {isDestroy ? null : (
        <ModalContent
          imageFile={imageFile}
          onClose={onClose}
          onChange={onChange}
        />
      )}
    </Modal>
  );
};

export default ImageCropModal;
