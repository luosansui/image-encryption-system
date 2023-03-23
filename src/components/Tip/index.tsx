import React, { useState } from "react";

export const Tip = ({ initShow }: { initShow: boolean }) => {
  //是否显示提示
  const [show, setShow] = useState(initShow);
  //是否销毁结构
  const [destroy, setDestroy] = useState(!initShow);

  /**
   * 关闭提示
   */
  const handleClose = () => {
    //先进入隐藏动画, 动画结束再销毁
    setShow(false);
    setTimeout(() => {
      setDestroy(true);
    }, 151);
  };
  return (
    <>
      {!destroy && (
        <div
          className={`text-center h-6 leading-6 -mt-4 mb-1 bg-yellow-100 rounded-md relative overflow-hidden transition-all ${
            show ? "" : "h-0 mt-0 mb-0"
          }`}
        >
          此浏览器可能不是基于Chromium内核, 可能存在功能缺失的情况
          <span
            className="absolute top-1/2 -translate-y-1/2 right-3 px-2 cursor-pointer"
            onClick={handleClose}
          >
            x
          </span>
        </div>
      )}
    </>
  );
};
