import { PixelBuffer } from "@/service/image/type";
import { createVertexBuffer } from "@/utils/webgl";
import { cloneElement } from "react";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;

const encrypt: encryptFuncType = async (data, key) => {
  const { processImageByWebGL } = await import("@/utils/webgl");
  //片段着色器
  const fragmentShader = `#version 300 es
  precision mediump float;
  uniform sampler2D u_texture;
  in vec2 v_texcoord;
  out vec4 outColor;
  const mat2 arnold = mat2(2.0, 1.0, 1.0, 1.0);
  void main() {
    outColor = texture(u_texture,v_texcoord);
  }
  `;
  //处理函数
  const process = (gl: WebGLRenderingContext) => {
    console.log("gl", gl);
  };
  // 返回输出数据
  return processImageByWebGL(data, fragmentShader, process);
};
const decrypt = encrypt;

export { encrypt, decrypt };
