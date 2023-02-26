export const decimalToPercentage = (value: number): number => {
  if (isNaN(value)) {
    return 0;
  }
  const percentage = Math.round(value * 1000) / 10;
  return Math.max(0, Math.min(100, percentage));
};
export const twoThirds = (num: number): number => {
  return Math.floor((num * 2) / 3);
};
