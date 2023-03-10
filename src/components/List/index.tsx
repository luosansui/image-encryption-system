import React, { useState, useRef, useEffect } from "react";
interface SelectProps {
  options: any[];
  onChange?: (pluginName: string) => void;
  className?: string;
  renderSelected?: (option?: any) => JSX.Element | string;
  renderList?: (option?: any) => JSX.Element;
  renderFooter?: (option?: any) => JSX.Element;
}

const Select: React.FC<SelectProps> = ({
  options,
  className,
  onChange,
  renderSelected,
  renderList,
  renderFooter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  //最大列表高度
  const [maxListHeight, setMaxListHeight] = useState(0);
  const ulRef = useRef<HTMLUListElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  /**
   * 选项点击事件
   * @param index 选中的option的index
   */
  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    onChange?.(options[index]?.name ?? "");
    setIsOpen(false);
  };
  //渲染选中的内容
  const SelectedRender = (props: { option: any }) => {
    if (props.option === undefined) {
      return null;
    }
    if (renderSelected) {
      return <>{renderSelected(props.option)}</>;
    }
    return <>{props.option?.toString()}</>;
  };
  //渲染list内容
  const ListRender = (props: { option: any }) => {
    if (renderList) {
      return renderList(props.option);
    }
    return <span className="block truncate">{props.option.toString()}</span>;
  };

  //渲染list底部内容
  const FooterRender = () => {
    return renderFooter ? renderFooter() : null;
  };
  //设置最大高度
  useEffect(() => {
    if (isOpen && ulRef.current && footerRef.current) {
      const { clientHeight } = ulRef.current;
      //获取底部组件的高度
      const footerHeight = footerRef.current.offsetHeight;
      //获取ul上边距
      const PaddingTop = parseFloat(
        window.getComputedStyle(ulRef.current).getPropertyValue("padding-top")
      );
      //获取两个li的高度
      const doubleListHeight = (clientHeight / options.length) * 2;
      //计算最大高度
      const maxDivHeight = doubleListHeight + PaddingTop + footerHeight;
      //设置最大高度
      setMaxListHeight(maxDivHeight);
    }
  }, [options, isOpen]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        type="button"
        className="bg-gray-50 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">
          <SelectedRender option={options[selectedOption]} />
        </span>
      </button>
      {isOpen && (
        <div
          style={{ maxHeight: maxListHeight }}
          className="absolute z-10 w-full mt-1 bg-white rounded-md border shadow-lg overflow-auto focus:outline-none sm:text-sm"
        >
          <ul ref={ulRef} className="pt-2">
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
          <div ref={footerRef}>
            <FooterRender />
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
