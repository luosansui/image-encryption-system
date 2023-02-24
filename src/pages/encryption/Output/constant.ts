import { TableColumn } from "@/components/Table/type";

export const columns: TableColumn[] = [
  {
    title: "原图",
    key: "origin",
  },
  {
    title: "生成图",
    key: "current",
  },
  {
    title: "压缩率",
    key: "compressionRatio",
  },
  {
    title: "操作",
    key: "operate",
  },
];
