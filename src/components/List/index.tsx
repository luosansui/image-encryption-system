import React, { useState, useRef, useEffect } from "react";
interface SelectProps {
  options: any[];
  checkedIndex: number;
  onChange?: (value: any) => void;
  className?: string;
  renderSelected?: (option?: any) => JSX.Element | string;
  renderList?: (option?: any) => JSX.Element;
  renderFooter?: (option?: any) => JSX.Element;
  disabled?: boolean;
  listNumber?: number;
}

const Select: React.FC<SelectProps> = ({
  options,
  checkedIndex,
  className,
  onChange,
  renderSelected,
  renderList,
  renderFooter,
  disabled,
  listNumber = 2,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  //最大列表高度
  const [maxListHeight, setMaxListHeight] = useState(0);
  const ulRef = useRef<HTMLUListElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  /**
   * 选项点击事件
   * @param index 选中的option的index
   */
  const handleOptionClick = (index: number) => {
    onChange?.(index);
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
    if (isOpen && ulRef.current) {
      const liDom = ulRef.current.childNodes[0] as HTMLElement;
      if (!liDom) {
        setMaxListHeight(80);
      }
      //计算最大高度
      const maxDivHeight = liDom.offsetHeight * listNumber + 10;
      //设置最大高度
      setMaxListHeight(maxDivHeight);
    }
  }, [options, isOpen, listNumber]);
  //点击空白处关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isOpen) {
        const target = e.target as HTMLElement;
        if (target.closest(".list-content") === rootRef.current) {
          return;
        }
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleClick);
    } else {
      document.removeEventListener("click", handleClick);
    }
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isOpen]);
  return (
    <div ref={rootRef} className={`list-content relative ${className ?? ""}`}>
      <button
        type="button"
        className="bg-gray-50 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="block truncate">
          <SelectedRender option={options[checkedIndex]} />
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md border shadow-lg  focus:outline-none sm:text-sm">
          <ul
            ref={ulRef}
            style={{ maxHeight: maxListHeight }}
            className="overflow-auto"
          >
            {options?.map((option, index) => (
              <li
                key={index}
                className={`px-3 py-2 my-1 cursor-pointer select-none hover:bg-gray-100 ${
                  checkedIndex === index ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => handleOptionClick(index)}
              >
                <ListRender option={option} />
              </li>
            ))}
          </ul>
          <div>
            <FooterRender />
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
