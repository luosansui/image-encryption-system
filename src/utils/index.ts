import { twoThirds } from "./number";
export const getThreadsNumber = (num: number) => {
  return Math.min(
    Math.floor(num / 3),
    twoThirds(navigator.hardwareConcurrency)
  );
};
