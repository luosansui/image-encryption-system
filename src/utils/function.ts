/**
 * 序列化函数
 * @param func 函数
 * @returns ArrayBuffer
 */
export const serializeFunction = (
  func: (...args: any[]) => any
): ArrayBuffer => {
  const funcString = func.toString();
  const encoder = new TextEncoder();
  const funcData = encoder.encode(funcString);
  return funcData.buffer;
};
/**
 * 反序列化函数, 但不支持import.meta
 * @param buffer ArrayBuffer
 * @returns 函数字符串
 */
export const deserializeFunction = (buffer: ArrayBuffer): string => {
  const data = new Uint8Array(buffer);
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(data);
};
