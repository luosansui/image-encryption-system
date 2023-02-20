import { Fragment } from "react";
import Button from "./Button";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children?: any }) {
  return (
    <Fragment>
      <Button />
      <Sidebar />
      <div className="p-4 sm:ml-64 h-full">{children}</div>
    </Fragment>
  );
}
