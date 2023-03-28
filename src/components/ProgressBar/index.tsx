import { decimalToPercentage } from "@/utils/number";
import React, { useMemo } from "react";
import { COLOR_CLASS_MAP } from "./constant";

type Props = {
  current: number;
  total: number;
  type: "fraction" | "percentage";
  className?: string;
  color?: "blue" | "red";
};

const ProgressBar: React.FC<Props> = ({
  current,
  total,
  type = "percentage",
  color = "blue",
  className,
}) => {
  //计算百分比
  const percentage = useMemo(
    () => decimalToPercentage(current / total),
    [current, total]
  );
  //计算内容
  const content = useMemo(() => {
    if (type === "fraction") {
      return `${current}/${total}`;
    }
    return `${percentage}%`;
  }, [current, percentage, total, type]);

  return (
    <div
      className={`relative h-4 rounded-full bg-white w-full ${className ?? ""}`}
    >
      <div
        className={`absolute h-full rounded-full transition-all bg-gradient-to-r ${COLOR_CLASS_MAP[color]}`}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute top-0 bottom-0 right-2 flex items-center text-gray-700 text-sm font-semibold select-none">
        {content}
      </div>
    </div>
  );
};

export default ProgressBar;
