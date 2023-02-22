import React, { Fragment } from "react";

export default function ControlPanel() {
  return (
    <div>
      <div className="text-center">
        <button
          type="button"
          className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 shadow font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          开始
        </button>
        <button
          type="button"
          className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 shadow font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          取消
        </button>
      </div>
    </div>
  );
}
