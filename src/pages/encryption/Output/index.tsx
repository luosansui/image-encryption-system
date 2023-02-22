import Table from "@/components/Table";
import { TableData } from "@/components/Table/type";
import React, { Fragment } from "react";
import { columns } from "./constant";

export default function Output({ className }: { className?: string }) {
  const data: TableData[] = [
    {
      id: "1",
      origin: 123,
      originSize: 123,
      originResolution: 123,
      current: 123,
      currentSize: 123,
      currentResolution: 123,
      compressionRatio: 123,
      operate: 123,
    },
    {
      id: "2",
      origin: 534,
      originSize: 34343,
      originResolution: 12343,
      current: 143423,
      currentSize: 134323,
      currentResolution: 134323,
      compressionRatio: 1343423,
      operate: 343123,
    },
  ];
  return (
    <Fragment>
      <div className={`overflow-auto rounded-md ${className ?? ""}`}>
        <Table columns={columns} data={data}></Table>
      </div>
    </Fragment>
  );
}
