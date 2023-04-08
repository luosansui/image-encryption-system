import { Plugin } from "@/service/plugin/type";
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
export type ExecFuncType = (
  pixelBuffer: PixelBuffer,
  secretKey: string,
  optionArgs: {
    message?: string | undefined;
    repeat?: number | undefined;
  }
) => Promise<{
  data: PixelBuffer;
  payload?: any;
}>;
