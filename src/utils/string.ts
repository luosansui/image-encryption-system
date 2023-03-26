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
 * 将string转变为md5的数值形式
 * @param str 密钥字符串
 * @param normalize 是否归一化
 * @param sliceLength 截取长度
 * @returns 数值
 */
export const string2HashNumber = (
  str: string,
  normalize = false,
  sliceLength = 13
): number => {
  // 截取长度
  const sliceLen = sliceLength > 13 ? 13 : sliceLength;
  // 使用SparkMD5算法对密钥进行哈希处理
  const hash = SparkMD5.hash(str);
  // 取哈希值前13位作为十六进制字符串
  const hex = hash.slice(0, sliceLen);
  // 将十六进制字符串转换为十进制数
  const num = parseInt(hex, 16);
  // 如果需要归一化，则将数值限制在0-1之间
  if (normalize) {
    return num / parseInt("f".repeat(sliceLen), 16);
  }
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
