import React from "react";
import { Tip } from "@/components/Tip";
import { isChromiumBased } from "@/utils";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children?: any }) {
  return (
    <div className="flex flex-col h-full">
      <Sidebar />
      <div className="md:ml-64 p-4 flex-1 flex flex-col">
        <Tip initShow={!isChromiumBased()} />
        {children}
      </div>
    </div>
  );
}
