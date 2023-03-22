import React, { useCallback, useState } from "react";
import CustomModal from "@/components/CustomModal";
import ImageCrop, {
  centerCrop,
  Crop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ReactComponent as SVG_lock } from "@/assets/svg/lock.svg";
import { ReactComponent as SVG_unlock } from "@/assets/svg/unlock.svg";
import { ReactComponent as SVG_full_screen } from "@/assets/svg/full_screen.svg";
import { ReactComponent as SVG_recover } from "@/assets/svg/recover.svg";

import Ruler from "../Ruler";
import { FileType } from "../Upload/type";
import { canvasPreview } from "./canvasPreview";
import { DEFAULT_ROTATE, DEFAULT_SCALE } from "./constant";

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
      quality: 1,
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
    if (!completedCrop) {
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
              height: completedCrop.height,
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
              <SVG_lock onClick={handleToggleAspectLock} fill="#444444" />
            ) : (
              <SVG_unlock onClick={handleToggleAspectLock} fill="#444444" />
            )}
          </div>
        </div>
        <div className="flex">
          <div className="mr-3">
            <SVG_full_screen onClick={handleCropAreaFull} fill="#444444" />
          </div>
          <SVG_recover onClick={handleCropAreaReset} fill="#444444" />
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
              className="transition-all duration-75 pointer-events-none"
              style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                backgroundImage: `linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%),
              linear-gradient(45deg, black 25%, transparent 25%, transparent 75%, black 75%)`,
                backgroundSize: "40px 40px",
                backgroundPosition: "0 0, 20px 20px",
              }}
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
  return (
    <CustomModal
      isOpen={isOpen}
      className="bg-white h-[75%] w-3/4 lg:w-2/3 2xl:w-2/5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 "
    >
      <ModalContent
        imageFile={imageFile}
        onClose={onClose}
        onChange={onChange}
      />
    </CustomModal>
  );
};

export default ImageCropModal;
