import React, { Navigate, RouteObject } from "react-router-dom";
import { lazy } from "react";
const Encryption = lazy(() => import("./pages/encryption"));
const Steganography = lazy(() => import("./pages/steganography"));

export type CustomRouteObject = RouteObject & {
  name?: string;
  description?: string;
  children?: CustomRouteObject[];
};
const routes: CustomRouteObject[] = [
  {
    name: "图像加密",
    path: "/encryption",
    description:
      "对图像进行批量加密处理, 请选择对应算法、上传图片、输入密钥、点击开始按钮进行操作\r\n请注意已加密图像不抗压缩攻击, 请勿进行有损压缩\r\n图像格式是否可用取决于浏览器支持",
    element: <Encryption />,
  },
  {
    name: "图像隐写",
    path: "/steganography",
    description:
      "对图像进行批量隐写处理, 请选择对应算法、上传图片、输入密钥、点击开始按钮进行隐写\r\n请注意已隐写图像不抗压缩攻击, 请勿进行有损压缩\r\n更多的信息重复次数可以增加鲁棒性",
    element: <Steganography />,
  },
  {
    path: "*",
    element: <Navigate to="/encryption" replace={true} />,
  },
] as CustomRouteObject[];

export default routes;
