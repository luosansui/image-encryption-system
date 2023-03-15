export type ImageFormatType =
  | "image/png"
  | "image/jpeg"
  | "image/bmp"
  | "image/webp"
  | "";
export interface ControlOptionType {
  pluginName: string;
  optionName: "encrypt" | "decrypt";
  key: string;
  isEmbedKey: boolean;
  format: ImageFormatType;
  quality: number;
}
