import { Fragment } from "react";
import Button from "./Button";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children?: any }) {
  return (
    <Fragment>
      <Button />
      <Sidebar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
          {children}
        </div>
      </div>
    </Fragment>
  );
}
