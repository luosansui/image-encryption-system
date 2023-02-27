import { serializeFunction } from "@/utils/function";
import { Task } from "./type";
export default class WorkService {
  private maxWorkers: number;
  private workerFunction: ArrayBuffer;
  private workers: Worker[] = [];
  private taskQueue: Task[] = [];
  private availableWorker = 0;

  constructor(maxWorkers: number, workerFunction: Function) {
    this.maxWorkers = maxWorkers;
    this.workerFunction = serializeFunction(workerFunction);
  }
  /**
   * 执行任务
   * @param taskArgs 任务参数
   * @returns 任务结果
   */
  public run<T>(...taskArgs: any[]): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const task: Task = { args: taskArgs, resolve, reject };
      this.taskQueue.push(task);
      await Promise.resolve(0); //保证所有任务先入队列再执行
      this.tryStartTask();
    });
  }
  /**
   * 设置worker的工作函数
   * @param workerFunction 传入的函数
   */
  public setWorkerFunction(workerFunction: Function) {
    this.workerFunction = serializeFunction(workerFunction);
    this.workers.forEach((worker) => {
      worker.postMessage({ func: this.workerFunction });
    });
  }
  /**
   * 销毁所有worker
   */
  public destroy() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.availableWorker = 0;
  }
  /**
   * 尝试执行任务
   */
  private tryStartTask() {
    //获取worker
    let worker: Worker | null = null;
    //任务队列为空,并且所有worker都可用，就代表全部任务已完成
    if (!this.taskQueue.length && this.availableWorker >= this.maxWorkers) {
      console.log("任务完成");
      return this.destroy(); //TODO:这里有问题
    }
    //如果worker未达到最大数量，创建新的worker
    else if (this.workers.length < this.maxWorkers) {
      console.log("new Worker");
      worker = new Worker("./worker.js");
      worker.postMessage({ func: this.workerFunction });
      this.workers.push(worker);
    }
    //如果worker已达到最大数量，判断是否有可用worker
    else if (this.availableWorker > 0) {
      this.availableWorker--;
      worker = this.workers.find(({ onmessage }) => !onmessage)!;
    }
    //如果没有可用worker，直接返回
    else {
      return;
    }
    //从任务队列中取出一个任务
    const task = this.taskQueue.shift();
    //如果任务已经被其他进程抢走，直接返回
    if (!task) {
      return;
    }
    //添加任务完成回调
    worker.onmessage = (event) => {
      worker!.onmessage = null;
      task.resolve(event.data);
      this.availableWorker++;
      this.tryStartTask();
    };
    worker.onerror = (event) => {
      task.reject(event);
    };
    worker.postMessage({ data: task.args });
  }
}
