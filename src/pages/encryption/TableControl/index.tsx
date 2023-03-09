import Button from "@/components/Button";
import React from "react";

export default function TableControl() {
  return (
    <div className="h-full flex flex-col">
      <div className="text-base font-semibold text-gray-600">页面操作</div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <Button className="mb-4 w-3/5">清空上传内容</Button>
        <Button className="mb-4 w-3/5">清空表格内容</Button>
        <Button className="mb-4 w-3/5">导出生成图</Button>
        <Button className="mb-4 w-3/5">导出算法插件</Button>
        <Button className="mb-4 w-3/5">复制密钥</Button>
      </div>
    </div>
  );
}
