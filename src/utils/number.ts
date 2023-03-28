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
