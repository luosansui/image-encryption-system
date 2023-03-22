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

export interface progressStatus {
  done: boolean;
  message: string;
  error: Error | null;
}

export type PluginJson = Omit<Plugin, "path"> & {
  default: Omit<Plugin, "path">;
};
