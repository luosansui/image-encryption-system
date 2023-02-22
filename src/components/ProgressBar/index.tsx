import React from "react";

type Props = {
  progress: number; // 进度
};

const ProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <div className="relative h-4 rounded-full bg-white w-full">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute top-0 bottom-0 right-2 flex items-center text-gray-700 text-sm font-semibold">
        {progress}%
      </div>
    </div>
  );
};

export default ProgressBar;
