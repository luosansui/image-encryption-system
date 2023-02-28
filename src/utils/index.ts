import { twoThirds } from "./number";
export const getThreadsNumber = (num: number) => {
  if (num >= 1) {
    return Math.max(
      Math.min(Math.ceil(num / 3), twoThirds(navigator.hardwareConcurrency)),
      1
    );
  }
  return 1;
};
