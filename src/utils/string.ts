import SparkMD5 from "spark-md5";

/**
 *
 * @param str 字符串
 * @returns 首字符大写的字符串
 */
export const capitalizeFirstLetter = (str: string) => {
  if (typeof str !== "string" || !str.trim()) {
    return "";
  }
  return str.trim().charAt(0).toUpperCase() + str.slice(1);
};
/**
 *
 * @param str 字符串
 * @returns 数字
 */
export const str2Num = (str: string): number => {
  const hash = SparkMD5.hash(str);
  const num = parseInt(hash.substring(0, 8), 16);
  return num;
};
