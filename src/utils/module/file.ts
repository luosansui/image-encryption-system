import SparkMD5 from "spark-md5";

export type ProgressCallback = (progress: number) => void;

/**
 * 计算文件的 MD5 值
 * @param file 文件对象
 * @param onProgress 计算进度回调函数
 * @returns Promise<string> MD5 值
 */
export function calculateMD5(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  const fileSize = file.size;
  const chunkSize = 1024 * 1024 * 10; // 每片 10MB

  if (fileSize <= chunkSize) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const spark = new SparkMD5.ArrayBuffer();
        spark.append(e.target?.result as ArrayBuffer);
        const md5 = spark.end();
        resolve(md5);
      };
    });
  }

  return new Promise<string>((resolve) => {
    const chunks = Math.ceil(fileSize / chunkSize);
    let currentChunk = 0;
    let currentPosition = 0;
    const spark = new SparkMD5.ArrayBuffer();

    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      spark.append(e.target?.result as ArrayBuffer);

      currentPosition += chunkSize;
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        const md5 = spark.end();
        resolve(md5);
      }

      if (onProgress) {
        const progress = Math.min((currentPosition / fileSize) * 100, 100);
        onProgress(progress);
      }
    };

    function loadNext() {
      const start = currentPosition;
      const end = Math.min(start + chunkSize, fileSize);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}
