import { FileType } from "@/components/Upload/type";

export class FileCache {
  private cache: WeakSet<FileType> = new WeakSet();

  add(file: FileType) {
    this.cache.add(file);
  }

  has(file: FileType) {
    return this.cache.has(file);
  }
}
