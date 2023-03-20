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
export const getNewFileName = (filename: string, MIME: string): string => {
  // 获取文件名（不包括扩展名）和扩展名
  const fileParts = filename.split(".");
  if (fileParts.length < 2) {
    return filename;
  }
  const nameWithoutExtension = fileParts.slice(0, -1).join(".");
  // 根据 MIME 类型设置新的扩展名
  let newExtension: string;

  switch (MIME) {
    case "image/png":
      newExtension = "png";
      break;
    case "image/jpeg":
      newExtension = "jpg";
      break;
    case "image/bmp":
      newExtension = "bmp";
      break;
    case "image/webp":
      newExtension = "webp";
      break;
    default:
      newExtension = fileParts[fileParts.length - 1];
  }

  // 返回新的文件名
  return `${nameWithoutExtension}.${newExtension}`;
};
