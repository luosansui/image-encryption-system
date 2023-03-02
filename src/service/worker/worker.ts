import { deserializeFunction } from "@/utils/function";
//缓存函数;
let cachedFunction: ((...args: any[]) => any) | null = null;
//注册监听事件
self.addEventListener(
  "message",
  (
    event: MessageEvent<{
      args?: any[];
      func?: ArrayBuffer;
    }>
  ) => {
    const { args, func } = event.data;
    if (func) {
      cachedFunction = deserializeFunction(func);
    } else if (args) {
      // 执行缓存函数
      const result = cachedFunction?.(...args) ?? undefined;
      self.postMessage(result);
    }
  }
);
/**
 * 严重注意事项：不能在worker进程中计算Blob URL
 * 则当worker进程结束时对应的内存会被释放
 * 虽然结束前渲染到页面上的图片正常显示了，但是实际上图片已经被释放了，链接不可再次访问
 * 结束后渲染到页面上的图片会直接404
 */
