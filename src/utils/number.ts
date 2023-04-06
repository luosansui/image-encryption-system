/**
 *
 * @param value 输入的数值
 * @returns 计算输入的百分比,输入数值无小数或者最多一位小数
 */
export const decimalToPercentage = (value: number): number => {
  if (isNaN(value)) {
    return 0;
  }
  const percentage = Math.round(value * 1000) / 10;
  return Math.max(0, Math.min(100, percentage));
};
/**
 *
 * @param num 输入的数值
 * @returns 计算输入的2/3的值
 */
export const twoThirds = (num: number): number => {
  return Math.floor((num * 2) / 3);
};
/**
 * 将B转换为KB,MB,GB,TB,PB
 * @param size 输入的大小
 * @returns 返回转换后的大小
 */
const SIZE_POWER_MAP = {
  B: 0,
  KB: 1,
  MB: 2,
  GB: 3,
  TB: 4,
  PB: 5,
  EB: 6,
  ZB: 7,
  YB: 8,
};
export const formatSize = (
  size: number,
  type: "KB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB"
): string => {
  return `${(size / Math.pow(1024, SIZE_POWER_MAP[type])).toFixed(1)} ${type}`;
};
