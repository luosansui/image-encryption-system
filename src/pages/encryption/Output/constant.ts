import { TableColumn } from "@/components/Table/type";

export const columns: TableColumn[] = [
  {
    title: "原图",
    key: "origin",
  },
  {
    title: "文件大小",
    key: "originSize",
  },
  {
    title: "文件分辨率",
    key: "originResolution",
  },
  {
    title: "生成图",
    key: "current",
  },
  {
    title: "文件大小",
    key: "currentSize",
  },
  {
    title: "文件分辨率",
    key: "currentResolution",
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
