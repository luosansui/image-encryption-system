import { useState } from "react";

interface SelectProps {
  options: string[];
  onChange?: (selectedOption: string) => void;
}

const Select: React.FC<SelectProps> = ({ options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onChange?.(option);
    setIsOpen(false);
  };

  const handleAddOption = () => {
    const newOption = window.prompt("Enter a new option:");
    if (newOption) {
      const newOptions = [...options, newOption];
      setSelectedOption(newOption);
      onChange?.(newOption);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">{selectedOption}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md border shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
          <ul className="pt-2">
            {options.map((option, index) => (
              <li
                key={index}
                className={`px-3 py-2 my-1 cursor-pointer select-none hover:bg-gray-100 ${
                  selectedOption === option ? "bg-gray-100 font-medium" : ""
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </li>
            ))}
          </ul>
          <button className="w-full py-2 border-t-2 border-gray-100 text-blue-500">
            添加算法
          </button>
        </div>
      )}
    </div>
  );
};

export default Select;
