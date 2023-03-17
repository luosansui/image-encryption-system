import { PixelBuffer } from "@/service/image/type";
/**
 * 创建 WebGL 上下文
 * @param width 宽度
 * @param height 高度
 * @param version 版本
 */
export const createWebGLContext = <T>(
  width: number,
  height: number,
  version: number | string
): T => {
  const canvas = new OffscreenCanvas(width, height);
  const ctxType = version.toString().trim().endsWith("2") ? "webgl2" : "webgl";
  const gl = canvas.getContext(ctxType, {
    preserveDrawingBuffer: true, //阻止保留绘制缓冲区
  }) as T;
  //gl不能为null
  if (!gl) {
    throw new Error("WebGL Context Create Error");
  }
  return gl;
};

/**
 * 编译 WebGL 着色器。
 * @param gl WebGLRenderingContext 对象。
 * @param type 着色器类型，可为 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER。
 * @param source 着色器源码。
 * @returns 编译后的着色器对象。
 */
export const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader => {
  const shader = gl.createShader(type);
  //shader不能为null
  if (!shader) {
    throw new Error("WebGL Shader Create Error");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const message = gl.getShaderInfoLog(shader);
  if (message && message.length > 0) {
    throw message;
  }
  return shader;
};

/**
 * 链接 WebGL 着色器程序。
 * @param gl WebGLRenderingContext 对象。
 * @param shaderProgram 要链接的着色器程序对象。
 * @param shaders 要链接的着色器对象列表。
 * @returns 链接后的着色器程序对象。
 */
export const linkShader = (
  gl: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  ...shaders: WebGLShader[]
): WebGLProgram => {
  for (const shader of shaders) {
    gl.attachShader(shaderProgram, shader);
  }
  gl.linkProgram(shaderProgram);
  const message = gl.getProgramInfoLog(shaderProgram);
  if (message && message.length > 0) {
    throw message;
  }
  for (const shader of shaders) {
    gl.deleteShader(shader);
  }
  return shaderProgram;
};

/**
 * 创建 WebGL 着色器程序对象。
 * @param gl WebGLRenderingContext 对象。
 * @param vertexShaderSource 顶点着色器源码。
 * @param fragmentShaderSource 片元着色器源码。
 * @returns 着色器程序对象。
 */
export const createWebGLProgram = (
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const shaderProgram = gl.createProgram();
  //shaderProgram不能为null
  if (!shaderProgram) {
    throw new Error("WebGL Program Create Error");
  }
  const linkedShaderProgram = linkShader(
    gl,
    shaderProgram,
    vertexShader,
    fragmentShader
  );
  return linkedShaderProgram;
};

/**
 * 创建纹理
 * @param gl WebGLRenderingContext 对象。
 * @param pixelData 像素数据。
 * @returns 纹理对象。
 */
export const createTexture = (
  gl: WebGLRenderingContext,
  pixelData: PixelBuffer
) => {
  const { width, height, buffer } = pixelData;
  const inputBuffer = new Uint8Array(buffer);
  //生成纹理
  const texture = gl.createTexture();
  //texture不能为null
  if (!texture) {
    throw new Error("WebGL Texture Create Error");
  }
  //绑定纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //贴图
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    inputBuffer
  );

  //纹理过滤
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //生成多级渐远纹理
  gl.generateMipmap(gl.TEXTURE_2D);
  //解绑纹理对象
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};
/**
 * 创建顶点缓冲区
 *
 */
export const createVertexBuffer = (
  gl: WebGLRenderingContext,
  target: number,
  data: ArrayBuffer | ArrayBufferView | SharedArrayBuffer,
  usage: number
) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(target, positionBuffer);
  gl.bufferData(target, data, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return positionBuffer;
};
/**
 * 通过WebGL处理图像并返回结果
 * @param data 输入图像数据
 * @param fragmentShaderSource 片元着色器源码
 * @param process 中间处理函数
 */
export const processImageByWebGL = (
  data: PixelBuffer,
  fragmentShaderSource: string,
  process?: (gl: WebGLRenderingContext) => any
) => {
  // 定义顶点着色器代码
  const vertexShaderSource = `#version 300 es
    precision mediump float;
    layout (location = 0) in vec2 a_position;
    out vec2 v_texcoord;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
      v_texcoord = a_position * 0.5 + 0.5;// 将顶点坐标转换为纹理坐标, 方便纹理采样
    }
    `;
  // 提取输入数据
  const { name, buffer, width, height } = data;
  // 创建一个新的 ArrayBuffer 用于存储输出数据
  const outputBuffer = new ArrayBuffer(buffer.byteLength);
  const outputData = new Uint8Array(outputBuffer);
  // 创建 WebGL 上下文
  const gl = createWebGLContext<WebGL2RenderingContext>(width, height, 2);
  // 创建 WebGL 程序
  const program = createWebGLProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  );
  // 设置 WebGL 视口
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // 创建顶点缓冲区
  const positionBuffer = createVertexBuffer(
    gl,
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  // 创建纹理
  const texture = createTexture(gl, data);
  // 使用 WebGL 进行渲染
  gl.useProgram(program);
  // 绑定顶点缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
  // 绑定纹理, 并反转 Y 轴
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.getUniformLocation(program, "u_texture");
  // 执行自定义处理
  process?.(gl);
  // 绘制
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  // 从缓冲区中读取输出数据
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, outputData);
  // 解绑对象
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  // 删除 WebGL 程序
  gl.deleteProgram(program);
  return {
    name,
    buffer: outputBuffer,
    width,
    height,
  };
};
