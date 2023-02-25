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
