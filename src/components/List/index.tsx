import React, { useState, useRef, useEffect } from "react";
import { Plugin } from "@/service/plugin/type";
import { capitalizeFirstLetter } from "@/utils/string";
interface SelectProps {
  options: Plugin[];
  onChange?: (pluginName: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ options, className, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    onChange?.(options[index]?.name ?? "");
    setIsOpen(false);
  };

  const handleAddOption = () => {
    // if (true) {
    //   const newOptions = [...options];
    //   setSelectedOption(newOptions.length);
    //   onChange?.(newOptions[newOptions.length - 1]);
    // }
  };

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  return (
    <div ref={selectRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        className="bg-gray-50 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">{options[selectedOption]?.name}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md border shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
          <ul className="pt-2">
            {options?.map((option, index) => (
              <li
                key={`${index}${option.name}}`}
                className={`px-3 py-2 my-1 cursor-pointer select-none hover:bg-gray-100 ${
                  selectedOption === index ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => handleOptionClick(index)}
              >
                <div className="font-semibold">{option.name}</div>
                <div className="text-xs truncate my-1">
                  {option.description}
                </div>
                <div className="flex justify-between text-xs ">
                  <span className="text-gray-500">
                    {capitalizeFirstLetter(option.language)}
                  </span>
                  <span className="text-gray-400">{option.version}</span>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="w-full py-2 border-t-2 border-gray-100 text-blue-500"
            onClick={handleAddOption}
          >
            添加算法
          </button>
        </div>
      )}
    </div>
  );
};

export default Select;
