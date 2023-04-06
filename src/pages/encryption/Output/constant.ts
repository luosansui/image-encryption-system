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
    title: "原图尺寸",
    key: "originSize",
  },
  {
    title: "生成图尺寸",
    key: "currentSize",
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
