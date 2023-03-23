import { serializeFunction } from "@/utils/function";
import { Task } from "./type";
// ?worker仅适用于Chrome浏览器, 详情见: https://github.com/vitejs/vite/issues/8621
import WorkerThread from "./worker?worker";
export default class WorkService {
  private readonly maxWorkers: number; //最大worker数量
  private readonly Script: new () => Worker; //worker脚本
  private exeFunc: ArrayBuffer; //worker执行函数
  private workers: Worker[] = []; //worker列表
  private taskQueue: Task[] = []; //任务队列
  private availableWorker = 0; //可用worker数量
  private promiseRes: null | ((value: any) => void) = null; //worker工作完成状态
  public autoDestroy = true; //是否自动销毁worker
  public status: Promise<string> = new Promise(
    (res) => (this.promiseRes = res)
  );

  //构造函数
  constructor(
    maxWorkers: number,
    exeFunc: (...args: any[]) => any,
    Script?: new () => Worker
  ) {
    this.maxWorkers = maxWorkers;
    this.Script = Script || WorkerThread;
    this.exeFunc = serializeFunction(exeFunc);
  }
  /**
   * 执行任务
   * @param taskArgs 任务参数
   * @returns 任务结果
   */
  public run<T>(...taskArgs: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task = { args: taskArgs, resolve, reject };
      this.taskQueue.push(task);
      //保证所有任务先入队列再执行
      Promise.resolve(0).then(() => this.tryStartTask());
    });
  }
  /**
   * 设置worker的工作函数
   * @param exeFunc 传入的函数
   */
  public setExeFunc(exeFunc: (...args: any[]) => any) {
    this.exeFunc = serializeFunction(exeFunc);
    this.workers.forEach((worker) => {
      worker.postMessage({ func: this.exeFunc });
    });
  }
  /**
   * 销毁所有worker
   */
  public destroy() {
    console.log("销毁所有worker服务");
    this.workers.forEach((worker) => {
      worker.terminate();
    });
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
    //情况1：队列为空, 不需要取worker
    if (!this.taskQueue.length) {
      //如果当前线程是最后一个并且就代表全部任务已完成
      if (this.availableWorker >= this.maxWorkers) {
        console.log("任务完成");
        //设置状态为完成
        this.promiseRes?.("done");
        //如果设置了自动销毁，就销毁所有worker
        if (this.autoDestroy) {
          this.destroy();
        }
      }
      return;
    }
    //情况2：队列不为空, 需要取worker
    //如果worker未达到最大数量，创建新的worker
    if (this.workers.length < this.maxWorkers) {
      console.log("new Worker");
      worker = new this.Script();
      this.workers.push(worker);
      worker.postMessage({ func: this.exeFunc! });
    }
    //否则，并且如果worker已达到最大数量，判断是否有可用worker
    else if (this.availableWorker > 0) {
      this.availableWorker--;
      worker = this.workers.find(({ onmessage }) => !onmessage)!;
    }
    //否则，判断为没有可用worker，直接返回
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
    worker.postMessage({ args: task.args });
  }
}
