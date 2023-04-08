import { PixelBuffer } from "@/service/image/type";
import { SHA512 } from "crypto-js";
import MersenneTwister from "./mersenne-twister";
import { utf8Encode, utf8Decode } from "./utf_8";

/**
 * 基于密码生成一个哈希顺序数组
 * @param password 用于生成哈希顺序的密码
 * @param arr_len 生成的顺序数组长度
 * @returns 生成的哈希顺序数组
 */
function get_hashed_order(password: string, arr_len: number) {
  // O(arr_len) algorithm
  const orders = Array.from(Array(arr_len).keys());
  const result = [];
  let loc;
  const seed = SHA512(password).words.reduce(function (total, num) {
    return total + Math.abs(num);
  }, 0);
  const rnd = new MersenneTwister(seed);
  for (let i = arr_len; i > 0; i--) {
    loc = rnd.genrand_int32() % i;
    result.push(orders[loc]);
    orders[loc] = orders[i - 1];
  }
  return result;
}

/**
 * 将字符串转换为二进制数组
 * @param str 输入字符串
 * @param num_copy 每个字符复制的次数
 * @returns 二进制数组
 */
function str_to_bits(str: string, num_copy: number) {
  const utf8array = utf8Encode(str);
  const result = [];
  const utf8strlen = utf8array.length;
  for (let i = 0; i < utf8strlen; i++) {
    for (let j = 128; j > 0; j = Math.floor(j / 2)) {
      if (Math.floor(utf8array[i] / j)) {
        for (let cp = 0; cp < num_copy; cp++) result.push(1);
        utf8array[i] -= j;
      } else {
        for (let cp = 0; cp < num_copy; cp++) result.push(0);
      }
    }
  }
  for (let j = 0; j < 24; j++) {
    for (let i = 0; i < num_copy; i++) {
      result.push(1);
    }
  }
  return result;
}
/**
 * 将二进制数组转换为字符串
 * @param bitarray 二进制数组
 * @param num_copy 每个字符复制的次数
 * @returns 字符串
 */
function bits_to_str(bitarray: number[], num_copy: number) {
  function merge_bits(bits: number[]) {
    const bits_len = bits.length;
    let bits_sum = 0;
    for (let i = 0; i < bits_len; i++) bits_sum += bits[i];
    return Math.round(bits_sum / bits_len);
  }

  const msg_array = [];
  let data, tmp;

  const msg_array_len = Math.floor(Math.floor(bitarray.length / num_copy) / 8);
  for (let i = 0; i < msg_array_len; i++) {
    data = 0;
    tmp = 128;
    for (let j = 0; j < 8; j++) {
      data +=
        merge_bits(
          bitarray.slice((i * 8 + j) * num_copy, (i * 8 + j + 1) * num_copy)
        ) * tmp;
      tmp = Math.floor(tmp / 2);
    }
    if (data == 255) break; //END NOTATION
    msg_array.push(data);
  }

  return utf8Decode(msg_array);
}
/**
 * 准备要写入的数据，对数据进行混淆，并按照加密密钥生成的哈希顺序将数据位插入到结果数组中
 * @param data_bits 要写入的数据位数组
 * @param enc_key 加密密钥
 * @param encode_len 要编码的长度
 * @returns 处理后的数据位数组
 */
function prepare_write_data(
  data_bits: number[],
  enc_key: string,
  encode_len: number
) {
  const data_bits_len = data_bits.length;
  if (data_bits.length > encode_len) throw "Can not hold this many data!";
  const result = Array(encode_len);
  for (let i = 0; i < encode_len; i++) {
    result[i] = Math.floor(Math.random() * 2); //obfuscation
  }

  const order = get_hashed_order(enc_key, encode_len);
  for (let i = 0; i < data_bits_len; i++) result[order[i]] = data_bits[i];

  return result;
}
function write_lsb(imageBuffer: Uint8ClampedArray, setdata: number[]) {
  function unsetbit(k: number) {
    return k % 2 == 1 ? k - 1 : k;
  }

  function setbit(k: number) {
    return k % 2 == 1 ? k : k + 1;
  }
  let j = 0;
  const newImageBuffer = new Uint8ClampedArray(imageBuffer.length);

  for (let i = 0; i < newImageBuffer.length; i += 4) {
    newImageBuffer[i] = setdata[j]
      ? setbit(imageBuffer[i])
      : unsetbit(imageBuffer[i]);
    newImageBuffer[i + 1] = setdata[j + 1]
      ? setbit(imageBuffer[i + 1])
      : unsetbit(imageBuffer[i + 1]);
    newImageBuffer[i + 2] = setdata[j + 2]
      ? setbit(imageBuffer[i + 2])
      : unsetbit(imageBuffer[i + 2]);
    newImageBuffer[i + 3] = imageBuffer[i + 3];
    j += 3;
  }
  return newImageBuffer.buffer;
}

/**
 * 准备要读取的数据，并按照加密密钥生成的哈希顺序读取数据
 * @param data_bits 要写入的数据位数组
 * @param enc_key 加密密钥
 * @returns 处理后的数据位数组
 */
function prepare_read_data(data_bits: number[], enc_key: string) {
  const data_bits_len = data_bits.length;
  const result = Array(data_bits_len);
  const order = get_hashed_order(enc_key, data_bits_len);

  for (let i = 0; i < data_bits_len; i++) result[i] = data_bits[order[i]];

  return result;
}
/**
 * 从图像数据中读取数据
 * @param imageDataArray 图像数据
 * @returns 读取到的数据
 */
function get_bits_lsb(imageDataArray: Uint8ClampedArray) {
  const result = [];
  for (let i = 0; i < imageDataArray.length; i += 4) {
    result.push(imageDataArray[i] % 2 == 1 ? 1 : 0);
    result.push(imageDataArray[i + 1] % 2 == 1 ? 1 : 0);
    result.push(imageDataArray[i + 2] % 2 == 1 ? 1 : 0);
  }
  return result;
}

/**
 * 从图像中提取消息
 * @param pixelData 图像数据
 * @param enc_key 用于提取消息的密钥
 * @param num_copy 每个位要写入图像的副本数。较大的值具有更强的鲁棒性，但容量较小
 * @returns 提取的消息
 */
export function readMsgFromImage(
  pixelData: PixelBuffer,
  enc_key: string,
  num_copy = 5
) {
  const imageDataArray = new Uint8ClampedArray(pixelData.buffer);
  const tempBitsArray = get_bits_lsb(imageDataArray);
  const tempArray = prepare_read_data(tempBitsArray, enc_key);
  return bits_to_str(tempArray, num_copy);
}
/**
 * 将消息写入图像
 * @param pixelData 图像数据
 * @param msg 要隐藏的消息
 * @param enc_key 用于加密消息的密钥
 * @param num_copy 每个位要写入图像的副本数。较大的值具有更强的鲁棒性，但容量较小
 * @returns 处理后的图像数据
 */
export const writeMsgToImage = (
  pixelData: PixelBuffer,
  msg: string,
  enc_key: string,
  num_copy = 5
): PixelBuffer => {
  const imageBuffer = new Uint8ClampedArray(pixelData.buffer);
  //保存结果
  let resultBuffer = pixelData.buffer;
  const encode_len = (imageBuffer.length / 4) * 3;
  // prepare data
  let bit_stream = str_to_bits(msg, num_copy);
  bit_stream = prepare_write_data(bit_stream, enc_key, encode_len);
  resultBuffer = write_lsb(imageBuffer, bit_stream);
  return {
    width: pixelData.width,
    height: pixelData.height,
    name: pixelData.name,
    buffer: resultBuffer,
  };
};
