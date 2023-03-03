import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "react-modal";
import ImageCrop, {
  centerCrop,
  Crop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./index.css";
import Ruler from "../Ruler";
import { FileType } from "../Upload/type";
import produce from "immer";
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
  //裁剪范围
  const [crop, setCrop] = useState<Crop>();
  //裁剪完成后的Crop
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  //裁剪比例
  const [aspect, setAspect] = useState<number | undefined>(undefined);
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
   *
   * @param crop 裁剪完成后的Crop
   */
  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
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
    if (!imageFile || !completedCrop) return;
    const offscreenCanvas = new OffscreenCanvas(
      completedCrop.width,
      completedCrop.height
    );
    const ctx = offscreenCanvas.getContext(
      "2d"
    ) as OffscreenCanvasRenderingContext2D;

    if (!ctx) return;
    ctx.translate(completedCrop.width / 2, completedCrop.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    const img = await createImageBitmap(imageFile.file);
    ctx.drawImage(
      img,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      -completedCrop.width / 2,
      -completedCrop.height / 2,
      completedCrop.width,
      completedCrop.height
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

  //取消裁剪
  const handleCancel = () => {
    onClose?.();
  };

  //切换裁剪比例锁定
  const handleToggleAspectLock = () => {
    if (aspect) {
      setAspect(undefined);
    } else if (imageRef.current) {
      const { width, height } = imageRef.current;
      const imageAspect = width / height;
      setAspect(imageAspect);
      setCrop(
        produce((draft) => {
          if (draft) {
            draft.width = imageAspect * draft.height;
          }
        })
      );
    }
  };
  /**
   * 获取居中Crop
   */
  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

  /**
   * 图片加载
   */
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    //图片纵横比
    const imageAspect = width / height;
    //设置裁剪区域
    setCrop(centerAspectCrop(width, height, imageAspect));
    //设置保持纵横比
    setAspect(imageAspect);
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-lg font-bold mr-2">裁剪图片</span>
          {aspect ? (
            <svg
              onClick={handleToggleAspectLock}
              className="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
            >
              <path
                d="M365.714286 438.857143l292.571429 0 0-109.714286q0-60.562286-42.861714-103.424t-103.424-42.861714-103.424 42.861714-42.861714 103.424l0 109.714286zM841.142857 493.714286l0 329.142857q0 22.820571-16.018286 38.838857t-38.838857 16.018286l-548.571429 0q-22.820571 0-38.838857-16.018286t-16.018286-38.838857l0-329.142857q0-22.820571 16.018286-38.838857t38.838857-16.018286l18.285714 0 0-109.714286q0-105.179429 75.410286-180.589714t180.589714-75.410286 180.589714 75.410286 75.410286 180.589714l0 109.714286 18.285714 0q22.820571 0 38.838857 16.018286t16.018286 38.838857z"
                fill="#444444"
              ></path>
            </svg>
          ) : (
            <svg
              onClick={handleToggleAspectLock}
              className="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
            >
              <path
                d="M365.714286 438.857143l292.571429 0 0-109.714286q0-60.562286-42.861714-103.424t-103.424-42.861714-103.424 42.861714-42.861714 103.424l0 109.714286zM841.142857 493.714286l0 329.142857q0 22.820571-16.018286 38.838857t-38.838857 16.018286l-548.571429 0q-22.820571 0-38.838857-16.018286t-16.018286-38.838857l0-329.142857q0-22.820571 16.018286-38.838857t38.838857-16.018286l18.285714 0 0-54.857143q0-22.820571 16.018286-38.838857t38.838857-16.018286l73.142857 0 0-54.857143q0-22.820571 16.018286-38.838857t38.838857-16.018286l73.142857 0q22.820571 0 38.838857 16.018286t16.018286 38.838857l0 54.857143 73.142857 0q22.820571 0 38.838857 16.018286t16.018286 38.838857z"
                fill="#444444"
              />
            </svg>
          )}
        </div>
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
            onComplete={handleCropComplete}
            minHeight={10}
            minWidth={10}
            aspect={aspect}
          >
            <img
              ref={imageRef}
              src={imageFile?.src}
              onLoad={handleImageLoad}
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
