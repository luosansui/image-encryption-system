import { Fragment } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children?: any }) {
  return (
    <div className="flex flex-col h-full">
      <Sidebar />
      <div className="p-4 sm:ml-64 flex-1">{children}</div>
    </div>
  );
}
{
  /* */
}
