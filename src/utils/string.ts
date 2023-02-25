export const capitalizeFirstLetter = (str: string) => {
  if (typeof str !== "string" || !str.trim()) {
    return "";
  }
  return str.trim().charAt(0).toUpperCase() + str.slice(1);
};
