// 缓存函数
let cachedFunction = null;

function deserializeFunction(buffer) {
  const data = new Uint8Array(buffer);
  const decoder = new TextDecoder("utf-8");
  const funcString = decoder.decode(data);
  const func = new Function(`return ${funcString}`)();
  return func;
}

self.addEventListener("message", (event) => {
  const { data, func } = event.data;
  if (func) {
    cachedFunction = deserializeFunction(func);
  } else {
    // 执行缓存函数
    if (cachedFunction) {
      const result = cachedFunction(...data);
      self.postMessage(result);
    }
  }
});
