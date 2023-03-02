import React, { Navigate, RouteObject } from "react-router-dom";
import { lazy } from "react";
const Encryption = lazy(() => import("./pages/encryption"));
const Steganography = lazy(() => import("./pages/steganography"));

export type CustomRouteObject = RouteObject & {
  name?: string;
  children?: CustomRouteObject[];
};
const routes: CustomRouteObject[] = [
  {
    name: "图像加密",
    path: "/encryption",
    element: <Encryption />,
  },
  {
    name: "图像隐写",
    path: "/steganography",
    element: <Steganography />,
  },
  {
    path: "*",
    element: <Navigate to="/encryption" replace={true} />,
  },
] as CustomRouteObject[];

export default routes;
