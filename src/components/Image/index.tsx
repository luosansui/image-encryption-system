import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import ImageCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./index.css";
import Ruler from "../Ruler";
Modal.setAppElement("#root");

interface Props {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onChange: (newImageUrl: string) => void;
}

const ImageCropModal: React.FC<Props> = ({
  imageUrl,
  isOpen,
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
  //裁剪组件缩放比例
  // const [cropWidthScale, setCropWidthScale] = useState(100);
  //旋转角度
  const [rotate, setRotate] = useState(0);
  //图片引用
  const imageRef = React.useRef<HTMLImageElement>(null);
  //图片容器引用
  const containerRef = React.useRef<HTMLImageElement>(null);
  //图片地址
  const [imageSrc, setImageSrc] = useState<string>("");
  /**
   *
   * @param newCrop 新的裁剪范围
   */
  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };
  /**
   *
   * @param newRotation 新的旋转角度
   */
  const handleRotationChange = (newRotation: number) => {
    setRotate(newRotation);
  };

  /*  const handleConfirm = () => {
    if (!imageRef || !crop.width || !crop.height) return;

    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      imageRef.current!,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      -crop.width / 2,
      -crop.height / 2,
      crop.width,
      crop.height
    );

    const newImageUrl = canvas.toDataURL();
    onChange(newImageUrl);
    handleClose();
  }; */
  /**
   * 处理图片缩放
   */
  /*   const handleImageScaleChange = () => {
    if (!imageRef || !imageRef.current) return;
    const image = imageRef.current;
    const container = containerRef.current;
    if (!container) return;
    //获取图片的宽高
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    //获取容器的宽高
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    //计算缩放比例
    const widthRatio = containerWidth / imageWidth;
    const heightRatio = containerHeight / imageHeight;
    //图片应该缩放的比例
    const scale = Math.min(widthRatio, heightRatio);
    //裁剪组件宽度缩放比例
    const cropScale = (scale * 100) / widthRatio;
    setCropWidthScale(cropScale);
  }; */
  /**
   * 处理图片加载
   */
  /*   const handleImageLoad = () => {
    if (!imageRef || !imageRef.current) return;
    const image = imageRef.current;
    const container = containerRef.current;
    if (!container) return;
    //获取图片的宽高
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    //获取容器的宽高
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    //计算缩放比例
    const widthRatio = containerWidth / imageWidth;
    const heightRatio = containerHeight / imageHeight;
    //图片应该缩放的比例
    const scale = Math.min(widthRatio, heightRatio);
    //裁剪组件宽度缩放比例
    const cropScale = (scale * 100) / widthRatio;
    setCropWidthScale(cropScale);
  }; */
  /**
   * 关闭模态框
   */
  const handleClose = () => {
    onClose();
  };

  //模态框打开后，设置图片地址
  const handleAfterOpen = () => {
    setImageSrc(imageUrl);
  };
  //模态框关闭后，重置裁剪范围
  const handleAfterClose = () => {
    setCrop(initCrop);
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
      <div className="h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">裁剪图片</h2>
          <button
            className="text-gray-600 hover:text-black cursor-pointer"
            onClick={handleClose}
          >
            x
          </button>
        </div>

        <div className="flex-1 bg-gray-200 relative">
          <div className="absolute w-full h-full p-4 overflow-auto flex">
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
                src={imageSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
              />
            </ImageCrop>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-col  items-center justify-center mb-4">
            {/* <span className="text-sm font-medium mr-2">Rotate:</span>
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:text-black cursor-pointer focus:outline-none mr-2"
                onClick={() => handleRotationChange(-90)}
              >
                -90°
              </button>
              <button
                className="text-gray-600 hover:text-black cursor-pointer focus:outline-none mr-2"
                onClick={() => handleRotationChange(90)}
              >
                +90°
              </button>
            </div> */}
            <Ruler min={0} max={100} defaultValue={0} />
          </div>
          <div className="flex justify-center">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium focus:outline-none"
              onClick={() => {}}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageCropModal;
