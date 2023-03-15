import { FileType } from "@/components/Upload/type";
//文件缓存服务
export class FileMD5Cache {
  private cache: Set<string> = new Set();

  public add(file: FileType) {
    this.cache.add(file.md5);
  }

  public has(file: FileType) {
    return this.cache.has(file.md5);
  }

  public isAllHas(files: FileType[]) {
    return files.every(this.has);
  }

  public filterNoHas(files: FileType[]) {
    return files.filter((file) => !this.has(file));
  }

  public filterHas(files: FileType[]) {
    return files.filter(this.has);
  }
}
