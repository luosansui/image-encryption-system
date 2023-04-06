import { PixelBuffer } from "@/service/image/type";
import {
  get_hashed_order,
  extract_block,
  dct,
  quantize_diff,
  idct,
  replace_block,
  img_16x16_to_8x8,
  img_8x8_to_16x16,
  rgb2ycbcr,
  ycbcr2rgb,
  rgbclip,
  str_to_bits,
} from "./utils";
/**
 * 准备要写入的数据，对数据进行混淆，并按照加密密钥生成的哈希顺序将数据位插入到结果数组中
 * @param data_bits 要写入的数据位数组
 * @param enc_key 加密密钥
 * @param encode_len 要编码的长度
 * @returns 处理后的数据位数组
 */
export function prepare_write_data(
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
export function write_dct_y(
  channel_data,
  channel_width,
  channel_length,
  setdata,
  multiply,
  loc
) {
  /* write a DCT manipulated Y channel from original Y channel
    Input:
        channel_data (1D array of size (channel_width * channel_length)): original Y data
        channel_width (int): channel width
        channel_length (int): channel length
        setdata (1D array of bits 0/1 array): data to stego
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
    */

  const row_block = Math.floor(channel_length / 8);
  const col_block = Math.floor(channel_width / 8);
  const num_block_bits = loc.length;
  if (num_block_bits * (row_block * col_block - 1) != setdata.length)
    throw "Image size does not match data size (Y channel)";
  let reference_dct_block;

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
      var qdiff = quantize_diff(
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
export function write_dct_CbCr(
  channel_data,
  channel_width,
  channel_length,
  setdata,
  multiply,
  loc
) {
  /* get a DCT manipulated Cb or Cr channel from original channel
    Input:
        channel_data (1D array of size (channel_width * channel_length)): original CbCr data
        channel_width (int): channel width
        channel_length (int): channel length
        setdata (1D array of bits 0/1 array): data to stego
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
    */

  const row_block = Math.floor(channel_length / 16);
  const col_block = Math.floor(channel_width / 16);
  const num_block_bits = loc.length;
  if (num_block_bits * (row_block * col_block - 1) != setdata.length)
    throw "Image size does not match data size (CbCr channel)";
  let reference_dct_block;

  for (let i = 0; i < row_block; i++)
    for (let j = 0; j < col_block; j++) {
      let block_y = extract_block(
        channel_data,
        16,
        i * 16,
        j * 16,
        channel_width
      );
      var block_y_8x8 = img_16x16_to_8x8(block_y);
      let dct_y = dct(block_y_8x8);
      if (i == 0 && j == 0) {
        reference_dct_block = dct_y;
        continue;
      }
      const dct_diff = dct_y.map(function (num, idx) {
        return num - reference_dct_block[idx];
      });
      var qdiff = quantize_diff(
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
      var stego_diff = block_y_stego.map(function (num, idx) {
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
export function write_lsb(imageBuffer: Uint8ClampedArray, setdata: number[]) {
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
export function dct_data_capacity(
  channel_width,
  channel_length,
  loc,
  use_y,
  use_downsampling
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
export function write_dct(
  imgData,
  channel_width,
  channel_length,
  setdata,
  multiply,
  loc,
  use_y,
  use_downsampling
) {
  /* Write Stego to imgData using DCT
    Input:
        imgData: to manipulate
        channel_width (int): channel width
        channel_length (int): channel length
        setdata (1D array of bits 0/1 array): data to stego
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
        use_y (bool): whether to manipulate y channel
        use_downsampling (bool): whether to downsample on CrCb
    */
  const data_capacity = dct_data_capacity(
    channel_width,
    channel_length,
    loc,
    use_y,
    use_downsampling
  );
  const y_data_len = data_capacity[0];
  const cbcr_data_len = data_capacity[1];

  const y = [],
    cb = [],
    cr = [];
  for (let i = 0; i < imgData.data.length; i += 4) {
    const ycbcr = rgb2ycbcr(
      imgData.data[i],
      imgData.data[i + 1],
      imgData.data[i + 2]
    );
    y.push(ycbcr[0]);
    cb.push(ycbcr[1]);
    cr.push(ycbcr[2]);
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
  for (let i = 0; i < imgData.data.length; i += 4) {
    const rgb = ycbcr2rgb(y[j], cb[j], cr[j]);
    imgData.data[i] = rgbclip(rgb[0]);
    imgData.data[i + 1] = rgbclip(rgb[1]);
    imgData.data[i + 2] = rgbclip(rgb[2]);
    j += 1;
  }
}

// main function
/**
 * 将消息写入画布
 * @param canvasid 画布ID，用于读取/写入数据
 * @param msg 要隐藏的消息
 * @param enc_key 用于加密消息的密钥
 * @param use_dct 对于DCT模式，使用true；对于LSB模式，使用false
 * @param num_copy 每个位要写入图像的副本数。较大的值具有更强的鲁棒性，但容量较小
 * @param multiply 乘以Q矩阵的整数（仅在use_dct=true时有效）
 * @param loc 在每个数据块上进行隐写的位置（仅在use_dct=true时有效）
 * @param use_y 是否操作Y通道（仅在use_dct=true时有效）
 * @param use_downsampling 是否在CrCb通道上进行降采样（仅在use_dct=true时有效）
 * @returns 成功时返回true，否则返回包含错误信息的字符串
 */
export const writeMsgToImage = async (
  pixelData: PixelBuffer,
  msg: string,
  enc_key: string,
  use_dct = false,
  num_copy = 5,
  multiply = 30,
  loc = [1, 2, 8, 9, 10, 16, 17],
  use_y = true,
  use_downsampling = true
): Promise<PixelBuffer> => {
  const imageBuffer = new Uint8ClampedArray(pixelData.buffer);
  //保存结果
  let resultBuffer = pixelData.buffer;
  const encode_len = (imageBuffer.length / 4) * 3;
  /* if (use_dct) {
      const cap = dct_data_capacity(
        pixelData.width,
        pixelData.height,
        loc,
        use_y,
        use_downsampling
      );
      encode_len = cap[0] + 2 * cap[1];
    } */
  // prepare data
  let bit_stream = str_to_bits(msg, num_copy);
  bit_stream = prepare_write_data(bit_stream, enc_key, encode_len);
  if (use_dct) {
    // write_dct(
    //   imgData,
    //   c.width,
    //   c.height,
    //   bit_stream,
    //   multiply,
    //   loc,
    //   use_y,
    //   use_downsampling
    // );
  } else {
    resultBuffer = write_lsb(imageBuffer, bit_stream);
  }
  return {
    width: pixelData.width,
    height: pixelData.height,
    name: pixelData.name,
    buffer: resultBuffer!,
  };
};
