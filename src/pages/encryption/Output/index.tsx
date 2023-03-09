import React, { Fragment } from "react";
import Table from "@/components/Table";
import { FileType } from "@/components/Upload/type";
import { columns } from "./constant";

export default function Output({
  pairList,
}: {
  pairList: [FileType, FileType][];
  className?: string;
}) {
  const generateData = () =>
    Array.from(pairList, ([originFile, encryptFile]) => ({
      id: encryptFile.md5,
      origin: (
        <img
          className="w-32 h-32 object-scale-down inline-block"
          src={originFile.src}
        />
      ),
      current: (
        <img
          className="w-32 h-32 object-scale-down inline-block"
          src={encryptFile.src}
        />
      ),
      currentResolution: 123,
      operate: 123,
    }));

  return (
    <Fragment>
      <div className="relative w-full h-full">
        <div className="absolute w-full h-full overflow-y-auto">
          <Table columns={columns} data={generateData()}></Table>
        </div>
      </div>
    </Fragment>
  );
}
