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
/**
 *
 * @param channel_width 通道宽度
 * @param channel_length 通道长度
 * @param loc 嵌入位置
 * @param use_y 是否使用Y通道
 * @param use_downsampling 是否使用下采样
 * @returns Y通道和CbCr通道的数据容量
 */
function dct_data_capacity(
  channel_width: number,
  channel_length: number,
  loc: number[],
  use_y: boolean,
  use_downsampling: boolean
) {
  const y_data_len = use_y
    ? (Math.floor(channel_length / 8) * Math.floor(channel_width / 8) - 1) *
      loc.length
    : 0;
  const cblock = use_downsampling ? 16 : 8;
  const cbcr_data_len =
    (Math.floor(channel_length / cblock) * Math.floor(channel_width / cblock) -
      1) *
    loc.length;
  return [y_data_len, cbcr_data_len];
}
/**
 *
 * @param r r通道的值
 * @param g g通道的值
 * @param b b通道的值
 * @returns Y Cb Cr空间的值
 */
function rgb2ycbcr(r: number, g: number, b: number) {
  /* RGB to Y Cb Cr space */
  return [
    0.299 * r + 0.587 * g + 0.114 * b,
    128 - 0.168736 * r - 0.331264 * g + 0.5 * b,
    128 + 0.5 * r - 0.418688 * g - 0.081312 * b,
  ];
}
/**
 * Y Cb Cr空间的值转换为RGB空间的值
 * @param y r通道的值
 * @param cb cb通道的值
 * @param cr  cr通道的值
 * @returns
 */
function ycbcr2rgb(y: number, cb: number, cr: number) {
  /* Y Cb Cr to RGB space */
  return [
    y + 1.402 * (cr - 128),
    y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128),
    y + 1.772 * (cb - 128),
  ];
}
/**
 *
 * @param mat 通道数据
 * @param block_size 块大小
 * @param x_min
 * @param y_min
 * @param img_num_col 通道宽度
 * @returns 提取的块
 */
function extract_block(
  mat: number[],
  block_size: number,
  x_min: number,
  y_min: number,
  img_num_col: number
) {
  const result = Array(block_size * block_size);
  for (let i = 0; i < block_size; i++)
    for (let j = 0; j < block_size; j++) {
      result[i * block_size + j] = mat[(x_min + i) * img_num_col + y_min + j];
    }
  return result;
}
/**
 * DCT变换
 * @param dataArray 8*8数据数组
 * @returns DCT变换后的数据
 */
function dct(dataArray: number[]) {
  // Apply DCT to a 8*8 data array (64). Expected input is [8*8]
  // input 8*8 | x,y loc x*8+y
  // output 8*8| u,v loc u*8+v
  const result = Array<number>(64).fill(0);
  let cu, cv, sum;
  for (let u = 0; u < 8; u++)
    for (let v = 0; v < 8; v++) {
      cu = u == 0 ? 1 / Math.sqrt(2) : 1;
      cv = v == 0 ? 1 / Math.sqrt(2) : 1;
      sum = 0;
      for (let x = 0; x < 8; x++)
        for (let y = 0; y < 8; y++) {
          sum +=
            dataArray[x * 8 + y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / 16) *
            Math.cos(((2 * y + 1) * v * Math.PI) / 16);
        }
      result[u * 8 + v] = (1 / 4) * cu * cv * sum;
    }

  return result;
}
/**
 * 逆DCT变换
 * @param dataArray 8*8数据数组
 * @returns 逆DCT变换后的数据
 */
function idct(dataArray: number[]) {
  const result = Array<number>(64).fill(0);
  let cu, cv, sum;
  for (let x = 0; x < 8; x++)
    for (let y = 0; y < 8; y++) {
      sum = 0;
      for (let u = 0; u < 8; u++)
        for (let v = 0; v < 8; v++) {
          cu = u == 0 ? 1 / Math.sqrt(2) : 1;
          cv = v == 0 ? 1 / Math.sqrt(2) : 1;
          sum +=
            cu *
            cv *
            dataArray[u * 8 + v] *
            Math.cos(((2 * x + 1) * u * Math.PI) / 16) *
            Math.cos(((2 * y + 1) * v * Math.PI) / 16);
        }
      result[x * 8 + y] = (1 / 4) * sum;
    }

  return result;
}
/**
 * 量化矩阵
 * @param multiply 量化系数
 * @returns 量化矩阵
 */
function quantization_matrix(multiply: number) {
  const Q = [
    16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16,
    24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109,
    103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120,
    101, 72, 92, 95, 98, 112, 100, 103, 99,
  ];
  for (let i = 0; i < 64; i++) {
    Q[i] *= multiply;
  }
  return Q;
}
/**
 * 量化
 * @param multiply 量化矩阵的乘数
 * @param loc 嵌入位置
 * @param mat 量化矩阵
 * @param encode_bits 要嵌入的数据位数组
 * @returns 逆DCT变换后的数据
 */
function quantize_diff(
  multiply: number,
  loc: number[],
  mat: number[],
  encode_bits: number[]
) {
  if (loc.length != encode_bits.length)
    throw "LOC and ENCODE_BITS have different sizes! This is a bug in code!";
  const Q = quantization_matrix(multiply);
  const result = Array(64).fill(0);
  let div_Q, low, high;
  for (let i = 0; i < loc.length; i++) {
    div_Q = mat[loc[i]] / Q[loc[i]];
    low = Math.floor(div_Q);
    if (Math.abs(low % 2) != encode_bits[i]) low -= 1;
    high = Math.ceil(div_Q);
    if (Math.abs(high % 2) != encode_bits[i]) high += 1;
    if (div_Q - low > high - div_Q) low = high;
    result[loc[i]] = low * Q[loc[i]] - mat[loc[i]];
  }
  return result;
}
/**
 * 量化矩阵块替换
 * @param mat 量化矩阵
 * @param block_size 块大小
 * @param x_min  x坐标
 * @param y_min y坐标
 * @param img_num_col 图像宽度
 * @param new_data 新数据
 */
function replace_block(
  mat: number[],
  block_size: number,
  x_min: number,
  y_min: number,
  img_num_col: number,
  new_data: number[]
) {
  for (let i = 0; i < block_size; i++)
    for (let j = 0; j < block_size; j++) {
      mat[(x_min + i) * img_num_col + y_min + j] = new_data[i * block_size + j];
    }
}
/**
 *
 * @param channel_data 通道数据
 * @param channel_width 通道宽度
 * @param channel_length 通道长度
 * @param setdata 要写入的数据
 * @param multiply Q矩阵的乘数
 * @param loc 嵌入位置
 */
function write_dct_y(
  channel_data: number[],
  channel_width: number,
  channel_length: number,
  setdata: number[],
  multiply: number,
  loc: number[]
) {
  const row_block = Math.floor(channel_length / 8);
  const col_block = Math.floor(channel_width / 8);
  const num_block_bits = loc.length;
  if (num_block_bits * (row_block * col_block - 1) != setdata.length)
    throw "Image size does not match data size (Y channel)";
  let reference_dct_block: number[];

  for (let i = 0; i < row_block; i++)
    for (let j = 0; j < col_block; j++) {
      let block_y = extract_block(channel_data, 8, i * 8, j * 8, channel_width);
      let dct_y = dct(block_y);
      if (i == 0 && j == 0) {
        reference_dct_block = dct_y;
        continue;
      }
      const dct_diff = dct_y.map(function (num, idx) {
        return num - reference_dct_block[idx];
      });
      const qdiff = quantize_diff(
        multiply,
        loc,
        dct_diff,
        setdata.slice(
          num_block_bits * (i * col_block + j - 1),
          num_block_bits * (i * col_block + j)
        )
      );
      dct_y = dct_y.map(function (num, idx) {
        return num + qdiff[idx];
      });
      block_y = idct(dct_y);
      //replace original block with stego Y
      replace_block(channel_data, 8, i * 8, j * 8, channel_width, block_y);
    }
}
/**
 * 量化矩阵块提取
 * @param mat 量化矩阵
 * @returns 逆DCT变换后的数据
 */
function img_16x16_to_8x8(mat: number[]) {
  /* Resize image from 16 * 16 to 8 * 8
  Input:
      mat (size 256)
  Output:
      out_mat (size 64)
  */
  const result = Array<number>(64);
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      result[i * 8 + j] =
        (mat[i * 2 * 8 + j * 2] +
          mat[(i * 2 + 1) * 8 + j * 2] +
          mat[i * 2 * 8 + j * 2 + 1] +
          mat[(i * 2 + 1) * 8 + j * 2 + 1]) /
        4;
    }
  return result;
}
/**
 * 量化矩阵块提取
 * @param mat 量化矩阵
 * @returns 逆DCT变换后的数据
 */
function img_8x8_to_16x16(mat: number[]) {
  /* Resize image from 8 * 8 to 16 * 16
  Input:
      mat (size 64)
  Output:
      out_mat (size 256)
  */
  const result = Array<number>(256);
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 16; j++) {
      result[i * 16 + j] = mat[Math.floor(i / 2) * 8 + Math.floor(j / 2)];
    }
  return result;
}
/**
 *
 * @param channel_data 通道数据
 * @param channel_width 通道宽度
 * @param channel_length 通道长度
 * @param setdata 要写入的数据
 * @param multiply  Q矩阵的乘数
 * @param loc 嵌入位置
 */
function write_dct_CbCr(
  channel_data: number[],
  channel_width: number,
  channel_length: number,
  setdata: number[],
  multiply: number,
  loc: number[]
) {
  const row_block = Math.floor(channel_length / 16);
  const col_block = Math.floor(channel_width / 16);
  const num_block_bits = loc.length;
  if (num_block_bits * (row_block * col_block - 1) != setdata.length)
    throw "Image size does not match data size (CbCr channel)";
  let reference_dct_block: number[];

  for (let i = 0; i < row_block; i++)
    for (let j = 0; j < col_block; j++) {
      let block_y = extract_block(
        channel_data,
        16,
        i * 16,
        j * 16,
        channel_width
      );
      const block_y_8x8 = img_16x16_to_8x8(block_y);
      let dct_y = dct(block_y_8x8);
      if (i == 0 && j == 0) {
        reference_dct_block = dct_y;
        continue;
      }
      const dct_diff = dct_y.map(function (num, idx) {
        return num - reference_dct_block[idx];
      });
      const qdiff = quantize_diff(
        multiply,
        loc,
        dct_diff,
        setdata.slice(
          num_block_bits * (i * col_block + j - 1),
          num_block_bits * (i * col_block + j)
        )
      );
      dct_y = dct_y.map(function (num, idx) {
        return num + qdiff[idx];
      });
      const block_y_stego = idct(dct_y);
      let stego_diff = block_y_stego.map(function (num, idx) {
        return num - block_y_8x8[idx];
      });
      stego_diff = img_8x8_to_16x16(stego_diff);
      block_y = block_y.map(function (num, idx) {
        return num + stego_diff[idx];
      });

      //replace original block with stego Y
      replace_block(channel_data, 16, i * 16, j * 16, channel_width, block_y);
    }
}
/**
 * 量化矩阵块提取
 * @param imgData 图像数据
 */
function rgbclip(val: number) {
  let a = Math.round(val);
  a = a > 255 ? 255 : a;
  return a < 0 ? 0 : a;
}
/**
 *
 * @param imgData 图像数据
 * @param channel_width 通道宽度
 * @param channel_length 通道长度
 * @param setdata 要写入的数据
 * @param multiply Q矩阵的乘数
 * @param loc 嵌入位置
 * @param use_y 是否使用Y通道
 * @param use_downsampling 是否使用下采样
 */
function write_dct(
  imgData: Uint8ClampedArray,
  channel_width: number,
  channel_length: number,
  setdata: number[],
  multiply: number,
  loc: number[],
  use_y: boolean,
  use_downsampling: boolean
) {
  const data_capacity = dct_data_capacity(
    channel_width,
    channel_length,
    loc,
    use_y,
    use_downsampling
  );
  const y_data_len = data_capacity[0];
  const cbcr_data_len = data_capacity[1];

  const y = [];
  const cb = [];
  const cr = [];
  const alpha = [];
  for (let i = 0; i < imgData.length; i += 4) {
    const ycbcr = rgb2ycbcr(imgData[i], imgData[i + 1], imgData[i + 2]);
    y.push(ycbcr[0]);
    cb.push(ycbcr[1]);
    cr.push(ycbcr[2]);
    alpha.push(imgData[i + 3]);
  }
  if (use_y)
    write_dct_y(
      y,
      channel_width,
      channel_length,
      setdata.slice(0, y_data_len),
      multiply,
      loc
    );
  const cbcr_func = use_downsampling ? write_dct_CbCr : write_dct_y;

  cbcr_func(
    cb,
    channel_width,
    channel_length,
    setdata.slice(y_data_len, y_data_len + cbcr_data_len),
    multiply,
    loc
  );
  cbcr_func(
    cr,
    channel_width,
    channel_length,
    setdata.slice(
      y_data_len + cbcr_data_len,
      y_data_len + cbcr_data_len + cbcr_data_len
    ),
    multiply,
    loc
  );
  let j = 0;
  const newImageData = new Uint8ClampedArray(imgData.length);
  for (let i = 0; i < imgData.length; i += 4) {
    const rgb = ycbcr2rgb(y[j], cb[j], cr[j]);
    newImageData[i] = rgbclip(rgb[0]);
    newImageData[i + 1] = rgbclip(rgb[1]);
    newImageData[i + 2] = rgbclip(rgb[2]);
    newImageData[i + 3] = alpha[j];
    j += 1;
  }
  return newImageData;
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
 * 从量化数据中获取嵌入的数据
 * @param multiply Q矩阵的乘数
 * @param loc 嵌入位置
 * @param quantized_mat 量化矩阵
 * @returns 提取的数据位数组
 */
function get_bit_from_quantized(
  multiply: number,
  loc: number[],
  quantized_mat: number[]
) {
  const Q = quantization_matrix(multiply);
  const result = [];
  for (let i = 0; i < loc.length; i++) {
    result.push(Math.abs(Math.round(quantized_mat[loc[i]] / Q[loc[i]]) % 2));
  }
  return result;
}
/**
 *  从Y通道中提取数据
 * @param channel_data 通道数据
 * @param channel_width  通道宽度
 * @param channel_length 通道长度
 * @param multiply Q矩阵的乘数
 * @param loc 嵌入位置
 * @returns 提取的数据位数组
 */
function get_dct_y(
  channel_data: number[],
  channel_width: number,
  channel_length: number,
  multiply: number,
  loc: number[]
) {
  const row_block = Math.floor(channel_length / 8);
  const col_block = Math.floor(channel_width / 8);
  const result = [];
  let reference_dct_block: number[];

  for (let i = 0; i < row_block; i++)
    for (let j = 0; j < col_block; j++) {
      const block_y = extract_block(
        channel_data,
        8,
        i * 8,
        j * 8,
        channel_width
      );
      const dct_y = dct(block_y);
      if (i == 0 && j == 0) {
        reference_dct_block = dct_y;
        continue;
      }
      result.push(
        get_bit_from_quantized(
          multiply,
          loc,
          dct_y.map(function (num, idx) {
            return num - reference_dct_block[idx];
          })
        )
      );
    }

  return result.flat();
}
/**
 * 获取CbCr通道的数据
 * @param channel_data 通道数据
 * @param channel_width 通道宽度
 * @param channel_length 通道长度
 * @param multiply Q矩阵的乘数
 * @param loc 嵌入位置
 * @returns 提取的数据位数组
 */
function get_dct_CbCr(
  channel_data: number[],
  channel_width: number,
  channel_length: number,
  multiply: number,
  loc: number[]
) {
  const row_block = Math.floor(channel_length / 16);
  const col_block = Math.floor(channel_width / 16);
  const result = [];
  let reference_dct_block: number[];

  for (let i = 0; i < row_block; i++)
    for (let j = 0; j < col_block; j++) {
      let block_y = extract_block(
        channel_data,
        16,
        i * 16,
        j * 16,
        channel_width
      );
      block_y = img_16x16_to_8x8(block_y);
      const dct_y = dct(block_y);
      if (i == 0 && j == 0) {
        reference_dct_block = dct_y;
        continue;
      }
      result.push(
        get_bit_from_quantized(
          multiply,
          loc,
          dct_y.map(function (num, idx) {
            return num - reference_dct_block[idx];
          })
        )
      );
    }
  return result.flat();
}
/**
 * 从图像数据中读取数据
 * @param imgData 图像数据
 * @param channel_width   通道宽度
 * @param channel_length 通道长度
 * @param multiply Q矩阵的乘数
 * @param loc 嵌入位置
 * @param use_y 是否使用Y通道
 * @param use_downsampling 是否使用下采样
 * @returns 读取到的数据
 */
function get_bits_dct(
  imgData: Uint8ClampedArray,
  channel_width: number,
  channel_length: number,
  multiply: number,
  loc: number[],
  use_y: boolean,
  use_downsampling: boolean
) {
  const y = [];
  const cb = [];
  const cr = [];
  const result = [];
  for (let i = 0; i < imgData.length; i += 4) {
    const ycbcr = rgb2ycbcr(imgData[i], imgData[i + 1], imgData[i + 2]);
    y.push(ycbcr[0]);
    cb.push(ycbcr[1]);
    cr.push(ycbcr[2]);
  }
  if (use_y)
    result.push(get_dct_y(y, channel_width, channel_length, multiply, loc));
  const cbcr_func = use_downsampling ? get_dct_CbCr : get_dct_y;
  result.push(cbcr_func(cb, channel_width, channel_length, multiply, loc));
  result.push(cbcr_func(cr, channel_width, channel_length, multiply, loc));

  return result.flat();
}
/**
 * 从图像中提取消息
 * @param pixelData 图像数据
 * @param enc_key 用于提取消息的密钥
 * @param num_copy 每个位要写入图像的副本数。较大的值具有更强的鲁棒性，但容量较小
 * @param multiply Q矩阵要乘以的整数
 * @param loc 要在块上隐藏的位置
 * @param use_y 是否要操作y通道
 * @param use_downsampling 是否要对CrCb进行下采样
 * @returns 提取的消息
 */
export function readMsgFromImage(
  pixelData: PixelBuffer,
  enc_key: string,
  num_copy = 23,
  multiply = 2,
  loc = [2, 9, 16],
  use_y = true,
  use_downsampling = false
) {
  const imageDataArray = new Uint8ClampedArray(pixelData.buffer);
  const tempBitsArray = get_bits_dct(
    imageDataArray,
    pixelData.width,
    pixelData.height,
    multiply,
    loc,
    use_y,
    use_downsampling
  );
  const tempArray = prepare_read_data(tempBitsArray, enc_key);
  return bits_to_str(tempArray, num_copy);
}
/**
 * 将消息写入图像
 * @param pixelData 图像数据
 * @param msg 要隐藏的消息
 * @param enc_key 用于加密消息的密钥
 * @param num_copy 每个位要写入图像的副本数。较大的值具有更强的鲁棒性，但容量较小
 * @param multiply Q矩阵要乘以的整数
 * @param loc 要在块上隐藏的位置
 * @param use_y 是否要操作y通道
 * @param use_downsampling 是否要对CrCb进行下采样
 * @returns 处理后的图像数据
 */
export const writeMsgToImage = (
  pixelData: PixelBuffer,
  msg: string,
  enc_key: string,
  num_copy = 23,
  multiply = 2,
  loc = [2, 9, 16],
  use_y = true,
  use_downsampling = false
): PixelBuffer => {
  const imageBuffer = new Uint8ClampedArray(pixelData.buffer);
  //保存结果
  let resultBuffer = pixelData.buffer;
  let encode_len = (imageBuffer.length / 4) * 3;
  const cap = dct_data_capacity(
    pixelData.width,
    pixelData.height,
    loc,
    use_y,
    use_downsampling
  );
  encode_len = cap[0] + 2 * cap[1];
  // prepare data
  let bit_stream = str_to_bits(msg, num_copy);
  bit_stream = prepare_write_data(bit_stream, enc_key, encode_len);
  resultBuffer = write_dct(
    imageBuffer,
    pixelData.width,
    pixelData.height,
    bit_stream,
    multiply,
    loc,
    use_y,
    use_downsampling
  );
  return {
    width: pixelData.width,
    height: pixelData.height,
    name: pixelData.name,
    buffer: resultBuffer,
  };
};
