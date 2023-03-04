import React, { useCallback, useState } from "react";
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
import { canvasPreview } from "./canvasPreview";
import { DEFAULT_ROTATE, DEFAULT_SCALE } from "./constant";
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
  //强制更改刻度(可用于重置刻度值)
  const [focusValue, setFocusValue] = useState({
    scale: 0,
    rotate: 0,
  });
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
    if (!imageFile || !imageRef.current || !completedCrop) return;
    //如果没有裁剪范围则取消裁剪
    const { width, height } = imageRef.current;
    if (
      !completedCrop ||
      completedCrop.width === 0 ||
      completedCrop.height === 0 ||
      (completedCrop.width === width &&
        completedCrop.height === height &&
        scale === 1 &&
        rotate === 0)
    ) {
      handleCancel();
      return;
    }
    //获取绘制完成的canvas
    const offscreenCanvas = await canvasPreview(
      imageFile.file,
      imageRef.current,
      completedCrop,
      scale,
      rotate
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
    if (!crop) {
      console.log("无绘图区域");
      return;
    }
    if (aspect) {
      setAspect(undefined);
    } else if (imageRef.current && crop) {
      const { width, height } = imageRef.current;
      const imageAspect = width / height;
      setAspect(imageAspect);
      setCrop(
        centerCrop(
          makeAspectCrop(
            {
              unit: "px",
              height: crop.height,
            },
            imageAspect,
            width,
            height
          ),
          width,
          height
        )
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

  /**
   * 铺满裁剪区域
   */
  const handleCropAreaFull = () => {
    if (!imageRef.current) {
      return;
    }
    const { width, height } = imageRef.current;
    //创建PixelCrop
    const pixelCrop: PixelCrop = {
      unit: "px",
      x: 0,
      y: 0,
      width,
      height,
    };
    setCrop(pixelCrop);
    setCompletedCrop(pixelCrop);
  };
  /**
   * 重置
   */
  const handleCropAreaReset = () => {
    //重置缩放
    setFocusValue({
      scale: 0,
      rotate: 0,
    });
    //重置裁剪区域
    if (crop && imageRef.current) {
      const { width, height } = imageRef.current;
      const imageAspect = width / height;
      setCrop(centerAspectCrop(width, height, imageAspect));
    }
  };
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-lg font-bold">裁剪图片</span>
          <div className="ml-2">
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
                <path d="M512 554.666667a42.666667 42.666667 0 0 0-42.666667 42.666666v128a42.666667 42.666667 0 0 0 85.333334 0v-128a42.666667 42.666667 0 0 0-42.666667-42.666666z m213.333333-170.666667H384V298.666667a128 128 0 0 1 218.453333-90.88 131.413333 131.413333 0 0 1 33.28 58.88 42.666667 42.666667 0 1 0 82.773334-21.333334 217.173333 217.173333 0 0 0-55.893334-97.706666A213.333333 213.333333 0 0 0 298.666667 298.666667v85.333333a128 128 0 0 0-128 128v298.666667a128 128 0 0 0 128 128h426.666666a128 128 0 0 0 128-128v-298.666667a128 128 0 0 0-128-128z m42.666667 426.666667a42.666667 42.666667 0 0 1-42.666667 42.666666H298.666667a42.666667 42.666667 0 0 1-42.666667-42.666666v-298.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h426.666666a42.666667 42.666667 0 0 1 42.666667 42.666667z"></path>
              </svg>
            )}
          </div>
        </div>
        <div className="flex">
          <div className="mr-3">
            <svg
              onClick={handleCropAreaFull}
              className="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
            >
              <path
                d="M795.5 192H581c-19.6 0-35.6 15.7-36 35.3-0.4 20.3 16.4 36.7 36.7 36.7h128.4L581 393.1c-14 14-14 36.9 0 50.9s36.9 14 50.9 0L760 315.9v129c0 19.6 15.8 35.6 35.3 36 20.2 0.4 36.7-16.4 36.7-36.7V228.5c0-20.1-16.3-36.5-36.5-36.5zM442.2 760H313.8L443 630.9c14-14 14-36.9 0-50.9s-36.9-14-50.9 0L264 708.1V579c0-19.6-15.8-35.6-35.3-36-20.2-0.4-36.7 16.4-36.7 36.7v215.6c0 20.3 16.4 36.7 36.7 36.7H443c19.6 0 35.6-15.7 36-35.3 0.3-20.3-16.5-36.7-36.8-36.7z"
                fill="#444444"
              ></path>
              <path
                d="M838 136c27.6 0 50 22.4 50 50v652c0 27.6-22.4 50-50 50H186c-27.6 0-50-22.4-50-50V186c0-27.6 22.4-50 50-50h652m0-72H186c-16.4 0-32.4 3.2-47.5 9.6-14.5 6.1-27.6 14.9-38.8 26.1-11.2 11.2-20 24.2-26.1 38.8-6.4 15.1-9.6 31.1-9.6 47.5v652c0 16.4 3.2 32.4 9.6 47.5 6.1 14.5 14.9 27.6 26.1 38.8 11.2 11.2 24.2 20 38.8 26.1 15.1 6.4 31.1 9.6 47.5 9.6h652c16.4 0 32.4-3.2 47.5-9.6 14.5-6.1 27.6-14.9 38.8-26.1 11.2-11.2 20-24.2 26.1-38.8 6.4-15.1 9.6-31.1 9.6-47.5V186c0-16.4-3.2-32.4-9.6-47.5-6.1-14.5-14.9-27.6-26.1-38.8-11.2-11.2-24.2-20-38.8-26.1-15.1-6.4-31.1-9.6-47.5-9.6z"
                fill="#444444"
              ></path>
            </svg>
          </div>
          <svg
            onClick={handleCropAreaReset}
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
          >
            <path
              fill="#444444"
              d="M544 247.466667c-23.466667 0-42.666667 19.2-42.666667 42.666666v196.266667l-115.2 115.2c-17.066667 17.066667-17.066667 42.666667 0 59.733333 8.533333 8.533333 19.2 12.8 29.866667 12.8s21.333333-4.266667 29.866667-12.8l128-128c10.666667-8.533333 12.8-23.466667 12.8-34.133333v-209.066667c0-25.6-19.2-42.666667-42.666667-42.666666z"
            ></path>
            <path
              fill="#444444"
              d="M480 74.666667c-113.066667 0-217.6 42.666667-298.666667 121.6V117.333333c0-23.466667-19.2-42.666667-42.666666-42.666666s-42.666667 19.2-42.666667 42.666666v164.266667c0 32 25.6 57.6 57.6 57.6h164.266667c23.466667 0 42.666667-19.2 42.666666-42.666667s-19.2-42.666667-42.666666-42.666666h-72.533334c64-59.733333 147.2-93.866667 234.666667-93.866667 187.733333 0 341.333333 153.6 341.333333 341.333333s-153.6 341.333333-341.333333 341.333334c-91.733333 0-177.066667-36.266667-241.066667-100.266667-25.6-25.6-46.933333-53.333333-61.866666-85.333333-10.666667-21.333333-36.266667-29.866667-57.6-19.2-21.333333 10.666667-29.866667 36.266667-19.2 57.6 19.2 38.4 46.933333 74.666667 76.8 106.666666 81.066667 81.066667 187.733333 125.866667 300.8 125.866667 234.666667 0 426.666667-192 426.666666-426.666667s-187.733333-426.666667-424.533333-426.666666z"
            ></path>
          </svg>
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
            ruleOfThirds={true}
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
              className="transition-all duration-75"
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            />
          </ImageCrop>
        </div>
      </div>

      <div className="my-4">
        <Ruler
          defaultScale={DEFAULT_SCALE}
          defaultRotate={DEFAULT_ROTATE}
          onChange={handleRulerChange}
          forceValue={focusValue}
        />
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
