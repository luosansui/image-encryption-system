export const serializeFunction = (func: Function): ArrayBuffer => {
  const funcString = func.toString();
  const encoder = new TextEncoder();
  const funcData = encoder.encode(funcString);
  return funcData.buffer;
};

export const deserializeFunction = (buffer: ArrayBuffer): Function => {
  const data = new Uint8Array(buffer);
  const decoder = new TextDecoder("utf-8");
  const funcString = decoder.decode(data);
  const func = new Function(`return ${funcString}`)();
  return func;
};
