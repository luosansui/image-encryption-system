import { PixelBuffer } from "@/service/image/type";

type encryptFuncType = (data: PixelBuffer, key: string) => Promise<PixelBuffer>;

const encrypt: encryptFuncType = async (data, key: string) => {
  const { processImageByWebGL } = await import("@/utils/webgl");
  const { padImageToSquare } = await import("@/utils/file");
  // 将图像填充为正方形
  const paddedData = padImageToSquare(data);
  // 片段着色器
  const fragmentShader = `#version 300 es
    precision highp float;
    uniform int u_iteration;
    uniform float u_size;
    uniform sampler2D u_texture;
    in vec2 v_texcoord;
    out vec4 outColor;
    void main() {
      const mat2 arnold = mat2(1.0, 1.0, 1.0, 2.0);
      vec2 uv = v_texcoord * u_size;
      for (int i = 0; i < u_iteration; i++) {
        uv = mod(arnold * uv, u_size);
      }
      outColor = texture(u_texture, uv / u_size);
    }
  `;

  // 处理函数
  const process = (gl: WebGLRenderingContext, program: WebGLProgram) => {
    // 获取 u_iteration 变量位置
    const iterationsLocation = gl.getUniformLocation(program, "u_iteration");
    gl.uniform1i(iterationsLocation, Number(key));
    // 获取 u_size 变量位置
    const sizeLocation = gl.getUniformLocation(program, "u_size");
    gl.uniform1f(sizeLocation, paddedData.width);
  };

  // 返回输出数据
  return processImageByWebGL(paddedData, fragmentShader, process);
};
const decrypt = async (data: PixelBuffer, key: string) => {
  const { processImageByWebGL } = await import("@/utils/webgl");
  const { restoreImageFromSquare } = await import("@/utils/file");
  // 片段着色器
  const fragmentShader = `#version 300 es
  precision highp float;
  uniform int u_iterations;
  uniform float u_size;
  uniform sampler2D u_texture;
  in vec2 v_texcoord;
  out vec4 outColor;
  void main() {
    const mat2 arnold = mat2(2.0, -1.0, -1.0, 1.0);
    vec2 uv = v_texcoord * u_size;
    for (int i = 0; i < u_iterations; i++) {
      uv = mod(arnold * uv, u_size);
    }
    outColor = texture(u_texture, uv / u_size);
  }
  `;

  // 处理函数
  const process = (gl: WebGLRenderingContext, program: WebGLProgram) => {
    // 获取 u_iterations 变量位置
    const iterationsLocation = gl.getUniformLocation(program, "u_iterations");
    gl.uniform1i(iterationsLocation, Number(key));
    // 获取 u_size 变量位置
    const sizeLocation = gl.getUniformLocation(program, "u_size");
    gl.uniform1f(sizeLocation, data.width);
  };

  // 进行Arnold变换
  const transformedData = processImageByWebGL(data, fragmentShader, process);

  // 将结果还原为原来的长方形形式
  const restoredData = restoreImageFromSquare(transformedData);

  return transformedData;
};

export { encrypt, decrypt };
