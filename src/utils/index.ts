import { twoThirds } from "./number";
export const getThreadsNumber = (num: number) => {
  if (num >= 1) {
    return Math.min(
      Math.ceil(num / 3),
      twoThirds(navigator.hardwareConcurrency)
    );
  }
  return 1;
};
