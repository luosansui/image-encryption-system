import { file2Image } from "@/utils/file";
import { PixelCrop } from "react-image-crop";

const TO_RADIANS = Math.PI / 180;

export async function canvasPreview(
  imageFile: File,
  imageView: HTMLImageElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const image = await file2Image(imageFile);
  const scaleX = image.naturalWidth / imageView.width;
  const scaleY = image.naturalHeight / imageView.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  const canvasWidth = Math.floor(crop.width * scaleX * pixelRatio);
  const canvasHeight = Math.floor(crop.height * scaleY * pixelRatio);
  const offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);

  const ctx = offscreenCanvas.getContext(
    "2d"
  ) as OffscreenCanvasRenderingContext2D;

  if (!ctx) {
    throw new Error("No 2d context");
  }

  ctx.scale(pixelRatio, pixelRatio);

  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  //ctx.save();
  //debugger;
  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  // ctx.restore();
  return offscreenCanvas;
}
