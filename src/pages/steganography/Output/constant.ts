import { TableColumn } from "@/components/Table/type";

export const columns: TableColumn[] = [
  {
    title: "隐写图",
    key: "image",
  },
  {
    title: "原图大小",
    key: "originSize",
  },
  {
    title: "隐写图大小",
    key: "currentSize",
  },
  {
    title: "压缩率",
    key: "compressionRatio",
  },
  {
    title: "承载信息",
    key: "message",
  },
  {
    title: "操作",
    key: "operate",
  },
];
