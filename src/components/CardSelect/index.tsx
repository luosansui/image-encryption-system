import React from "react";

interface CardSelectOptionType {
  title: string;
  description: string;
}

export default function CardSelect({
  options,
  disabled,
  onChange,
}: {
  options: CardSelectOptionType[];
  disabled?: boolean;
  onChange?: (value: number) => void;
}) {
  //选择回调
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    onChange?.(value);
  };
  const disabledClass = disabled ? "opacity-80 pointer-events-none" : "";
  return (
    <ul className="grid w-full gap-4 md:grid-cols-2 mb-5">
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
            <svg
              aria-hidden="true"
              className="w-10 h-10 ml-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </label>
        </li>
      ))}
    </ul>
  );
}
