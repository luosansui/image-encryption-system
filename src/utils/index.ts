import { twoThirds } from "./number";
//这里存放更偏向业务的工具函数
/**
 * 获取线程数
 */
export const getThreadsNumber = (num: number) => {
  if (num >= 1) {
    return Math.max(
      Math.min(Math.ceil(num / 3), twoThirds(navigator.hardwareConcurrency)),
      1
    );
  }
  return 1;
};
