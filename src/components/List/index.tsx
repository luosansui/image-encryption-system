import React, { useState, useRef, useEffect } from "react";
import { Plugin } from "@/service/plugin/type";
interface SelectProps {
  options: Plugin[];
  onChange?: (pluginName: string) => void;
  className?: string;
  renderList?: (option?: any) => JSX.Element;
  renderFooter?: (option?: any) => JSX.Element;
}

const Select: React.FC<SelectProps> = ({
  options,
  className,
  onChange,
  renderList,
  renderFooter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const selectRef = useRef<HTMLDivElement>(null);
  /**
   * 选项点击事件
   * @param index 选中的option的index
   */
  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    onChange?.(options[index]?.name ?? "");
    setIsOpen(false);
  };

  //渲染list内容
  const ListRender = (props: { option: any }) => {
    if (renderList) {
      return renderList(props.option);
    }
    return <span className="block truncate">{props.option.toString()}</span>;
  };

  //渲染list底部内容
  const ListFooter = () => {
    return renderFooter ? renderFooter() : null;
  };

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
                key={index}
                className={`px-3 py-2 my-1 cursor-pointer select-none hover:bg-gray-100 ${
                  selectedOption === index ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => handleOptionClick(index)}
              >
                <ListRender option={option} />
              </li>
            ))}
          </ul>
          <ListFooter />
        </div>
      )}
    </div>
  );
};

export default Select;
