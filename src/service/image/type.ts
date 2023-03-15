import { FileType } from "@/components/Upload/type";
import {
  ControlOptionType,
  ImageFormatType,
} from "@/pages/encryption/ControlPanel/type";
import { Plugin } from "@/service/plugin/type";

export type encryptFuncType = (
  data: ArrayBuffer,
  secretKey: string
) => ArrayBuffer;
export type decryptFuncType = encryptFuncType;

export interface PixelBuffer {
  name: string;
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

export type PluginJson = Omit<Plugin, "path"> & {
  default: Omit<Plugin, "path">;
};
