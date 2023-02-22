import { ReactNode } from "react";

export interface TableColumn {
  title: string;
  key: string;
}
export interface TableData {
  id: string;
  [key: string]: any;
}

export interface TableProps {
  columns: TableColumn[];
  data: TableData[];
}
