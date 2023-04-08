import { PixelBuffer } from "@/service/image/type";
import { processImageByWebGL2 } from "@/utils/webgl";
import { padImageToSquare, restoreImageFromSquare } from "@/utils/file";

type encryptFuncType = (
  data: PixelBuffer,
  key: string
) => {
  data: PixelBuffer;
};
type decryptFuncType = encryptFuncType;

const encrypt: encryptFuncType = (data, key) => {
  // 将图像填充为正方形
  const paddedData = padImageToSquare(data);
  // 片段着色器
  const fragmentShader = `#version 300 es
    precision mediump float;
    uniform int u_iteration;
    uniform float u_size;
    uniform sampler2D u_texture;
    in vec2 v_texcoord;
    out vec4 outColor;
    void main() {
      // 将纹理坐标转换为像素坐标
      ivec2 pixelCoordinate = ivec2(v_texcoord * u_size);
      // 定义变换矩阵
      const mat2 transformMatrix = mat2(1.0, 1.0, 1.0, 2.0);
      //迭代变换
      for (int i = 0; i < u_iteration; i++) {
        // 将 pixelCoordinate 转换为 vec2 类型以进行矩阵乘法
        vec2 tempPixelCoordinate = vec2(pixelCoordinate);
        // 计算矩阵乘积
        tempPixelCoordinate = transformMatrix * tempPixelCoordinate;
        // 将结果转换回 ivec2 类型
        pixelCoordinate = ivec2(tempPixelCoordinate);
        // 为结果加上 int(u_size)
        pixelCoordinate = pixelCoordinate + int(u_size);
        // 对结果取模 u_size
        pixelCoordinate = pixelCoordinate % int(u_size);
      }

     // 将获取到的颜色值设置为输出颜色
     outColor = texelFetch(u_texture, pixelCoordinate, 0);
    }
  `;

  // 处理函数
  const process = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    // 获取 u_iteration 变量位置
    const iterationsLocation = gl.getUniformLocation(program, "u_iteration");
    gl.uniform1i(iterationsLocation, Number(key));
    // 获取 u_size 变量位置
    const sizeLocation = gl.getUniformLocation(program, "u_size");
    gl.uniform1f(sizeLocation, paddedData.width);
  };

  // 返回输出数据
  return {
    data: processImageByWebGL2(paddedData, fragmentShader, process),
  };
};
const decrypt: decryptFuncType = (data, key) => {
  // 片段着色器
  const fragmentShader = `#version 300 es
  precision highp float;
  uniform int u_iterations;
  uniform float u_size;
  uniform sampler2D u_texture;
  in vec2 v_texcoord;
  out vec4 outColor;
  void main() {
    // 将纹理坐标转换为像素坐标
    ivec2 pixelCoordinate = ivec2(v_texcoord * u_size);
    // 定义变换矩阵
    const mat2 transformMatrix = mat2(2.0, -1.0, -1.0, 1.0);
    for (int i = 0; i < u_iterations; i++) {
      // 将 pixelCoordinate 转换为 vec2 类型以进行矩阵乘法
      vec2 tempPixelCoordinate = vec2(pixelCoordinate);
      // 计算矩阵乘积
      tempPixelCoordinate = transformMatrix * tempPixelCoordinate;
      // 将结果转换回 ivec2 类型
      pixelCoordinate = ivec2(tempPixelCoordinate);
      // 为结果加上 int(u_size)
      pixelCoordinate = pixelCoordinate + int(u_size);
      // 对结果取模 u_size
      pixelCoordinate = pixelCoordinate % int(u_size);
    }
    outColor = texelFetch(u_texture, pixelCoordinate, 0);
  }
  `;

  // 处理函数
  const process = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    // 获取 u_iterations 变量位置
    const iterationsLocation = gl.getUniformLocation(program, "u_iterations");
    gl.uniform1i(iterationsLocation, Number(key));
    // 获取 u_size 变量位置
    const sizeLocation = gl.getUniformLocation(program, "u_size");
    gl.uniform1f(sizeLocation, data.width);
  };

  // 进行Arnold变换
  const transformData = processImageByWebGL2(data, fragmentShader, process);
  //裁剪图像
  return {
    data: restoreImageFromSquare(transformData),
  };
};

export { encrypt, decrypt };
