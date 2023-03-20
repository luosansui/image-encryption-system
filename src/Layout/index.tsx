import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children?: any }) {
  return (
    <div className="flex flex-col h-full">
      <Sidebar />
      <div className="p-4 md:ml-64 flex-1">{children}</div>
    </div>
  );
}
{
  /* */
}
