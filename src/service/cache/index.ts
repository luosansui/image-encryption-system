import { FileType } from "@/components/Upload/type";
//文件缓存服务
export class FileCache {
  private cache: WeakSet<FileType> = new WeakSet();

  public add(file: FileType) {
    this.cache.add(file);
  }

  public has(file: FileType) {
    return this.cache.has(file);
  }

  public isAllHas(files: FileType[]) {
    return files.every(this.has);
  }

  public filterNotHas(files: FileType[]) {
    return files.filter((file) => !this.has(file));
  }

  public filterHas(files: FileType[]) {
    return files.filter(this.has);
  }
}
