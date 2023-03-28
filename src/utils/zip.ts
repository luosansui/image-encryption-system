import JSZip from "jszip";
import { saveAs } from "file-saver";
const MAX_ZIP_SIZE = 700 * 1024 * 1024; // 700MB，最大压缩包大小

/**
 * 创建保存压缩包
 * @param files 文件列表
 * @param maxSize 最大压缩包大小
 */
export const multipleFileDownload = async (
  files: File[],
  zipName = "encrypted-images",
  maxSize = MAX_ZIP_SIZE
) => {
  let currentZipSize = 0; // 当前压缩包大小
  let currentZipIndex = 0; // 当前压缩包索引
  let zip = new JSZip();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    //如果当前文件大小超过最大值或者是单文件则直接保存该文件
    if (file.size > maxSize || files.length === 1) {
      saveAs(file, file.name);
      continue;
    }
    // 如果当前压缩包大小超过最大值，或者当前文件大小超过最大值，则生成并保存该压缩包，然后创建一个新的压缩包
    if (currentZipSize + file.size > maxSize) {
      //获取结果
      const content = await zip.generateAsync({ type: "blob" });
      //保存文件
      const name = currentZipIndex ? `${zipName}(${currentZipIndex})` : zipName;
      saveAs(content, `${name}.zip`);
      //创建新的压缩包
      zip = new JSZip();
      currentZipSize = 0;
      currentZipIndex++;
    }
    //添加文件
    zip.file(file.name, file);
    currentZipSize += file.size;
  }
  // 生成并保存最后一个压缩包
  const content = await zip.generateAsync({ type: "blob" });
  if (Object.keys(zip.files).length > 0) {
    const name = currentZipIndex ? `${zipName}(${currentZipIndex})` : zipName;
    saveAs(content, `${name}.zip`);
  }
};
