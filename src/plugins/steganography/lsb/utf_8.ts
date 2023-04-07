/**
 * 用于将UTF-8编码的字节数组解码为字符串
 * @param {*} bytes 字节数组
 * @returns 解码后的字符串
 */
export function utf8Decode(bytes: number[]): string {
  const chars = [];
  let offset = 0;
  const length = bytes.length;
  let c;
  let c2;
  let c3;

  while (offset < length) {
    c = bytes[offset];
    c2 = bytes[offset + 1];
    c3 = bytes[offset + 2];

    if (128 > c) {
      chars.push(String.fromCharCode(c));
      offset += 1;
    } else if (191 < c && c < 224) {
      chars.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      offset += 2;
    } else {
      chars.push(
        String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
      );
      offset += 3;
    }
  }

  return chars.join("");
}
/**
 * 用用于将字符串编码为UTF-8字节数组
 * @param {*} str 输入字符串
 * @returns 编码后的字节数组
 */
export function utf8Encode(str: string) {
  const bytes = [];
  let offset = 0;
  let char;

  str = encodeURI(str);
  const length = str.length;

  while (offset < length) {
    char = str[offset];
    offset += 1;

    if ("%" !== char) {
      bytes.push(char.charCodeAt(0));
    } else {
      char = str[offset] + str[offset + 1];
      bytes.push(parseInt(char, 16));
      offset += 2;
    }
  }

  return bytes;
}
