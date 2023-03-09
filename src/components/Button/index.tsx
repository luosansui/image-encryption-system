import React from "react";
import { TYPES } from "./constant";

export default function Button(
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & { className?: string; typeColor?: "white" | "blue" }
) {
  const { typeColor = "blue", className = "" } = props;
  return (
    <button
      type="button"
      {...props}
      className={`whitespace-nowrap  outline-none shadow font-medium rounded-lg text-sm px-5 py-2.5 mr-2 ${TYPES[typeColor]} ${className}`}
    />
  );
}
