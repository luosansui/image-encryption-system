import React from "react";
import { ReactComponent as SVG_right_arrow } from "@/assets/svg/right_arrow.svg";
interface CardSelectOptionType {
  title: string;
  description: string;
}

export default function CardSelect({
  options,
  disabled,
  onChange,
  className,
}: {
  options: CardSelectOptionType[];
  disabled?: boolean;
  className?: string;
  onChange?: (value: number) => void;
}) {
  //选择回调
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onChange?.(value);
  };
  const disabledClass = disabled ? "opacity-80 pointer-events-none" : "";
  return (
    <ul className={`grid w-full gap-4 md:grid-cols-2 mb-5 ${className}`}>
      {options.map((item, index) => (
        <li key={index}>
          <input
            type="radio"
            id={`select-${index}`}
            name="hosting"
            value={`${index}`}
            className="hidden peer"
            required
            defaultChecked={index === 0}
            disabled={disabled}
            onChange={handleOptionChange}
          />
          <label
            htmlFor={`select-${index}`}
            className={`inline-flex items-center justify-between w-full p-4 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 ${disabledClass}`}
          >
            <div className="block">
              <div className="w-full text-lg font-semibold">{item.title}</div>
              <div className="w-full">{item.description}</div>
            </div>
            <SVG_right_arrow fill="currentColor" className="w-10 h-10 ml-3" />
          </label>
        </li>
      ))}
    </ul>
  );
}
