import React from "react";
import { TYPES } from "./constant";

export default function Button(
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & { className?: string; typeColor?: "white" | "blue"; disabled?: boolean }
) {
  const { typeColor = "blue", className = "", disabled, ...rest } = props;
  const disabledClass = disabled ? "opacity-70 pointer-events-none" : "";
  return (
    <button
      type="button"
      {...rest}
      className={`whitespace-nowrap outline-none shadow font-medium rounded-lg text-sm px-5 py-2.5 ${TYPES[typeColor]} ${className} ${disabledClass}`}
    />
  );
}
