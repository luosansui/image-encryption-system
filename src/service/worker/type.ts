export type Task = {
  args: any[];
  resolve: (result: any) => void;
  reject: (error: any) => void;
};
