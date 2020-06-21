import { proxy, wrap } from 'comlink';
import RunnerWorker from './runner.worker';
import { uuidv4 } from './uuid';
import { colors } from './optimizerTypeCheckboxes';
import { GamePlot } from "./GamePlot";
import { Trajectory } from "./Trajectory";

export type Running = Boolean;

export class WorkerManager {
  gameplot: GamePlot;
  workers: Record<string, [Running, Worker, Trajectory]>;
  constructor(owner) {
    this.gameplot = owner;
    this.workers = {};
  }
  freeze() {
    // In contrast to `stop` it still maintains the references so trajectories can be recovered.
    for (const uuid of Object.keys(this.workers)) {
      const [running, worker, trajectory] = this.workers[uuid];
      worker.terminate();
      this.workers[uuid] = [false, worker, trajectory];
    }
  }
  stop() {
    this.freeze();
    this.workers = {};
  }
  start(x, y) {
    this.stop();
    this.gameplot.state.optimizerTypes.forEach(optimizerType => {
      console.log(`Starting ${optimizerType}`);
      const uuid = uuidv4();
      const worker = new RunnerWorker();
      const trajectory = new Trajectory(optimizerType, colors[optimizerType], [x, y], this.gameplot);
      this.workers[uuid] = [true, worker, trajectory];
      const workerApi = wrap<import('./runner.worker').RunnerWorker>(worker);
      workerApi.run(x, y, this.gameplot.state.gameType, optimizerType, this.gameplot.state.lr, 10000, this.gameplot.updateInterval, proxy(this.callback), uuid);
    });
  }
  callback = (xs, ys, uuid) => {
    if (this.workers.hasOwnProperty(uuid)) {
      const [running, worker, trajectory] = this.workers[uuid];
      if (running) {
        trajectory.update(xs, ys);
      }
    }
  };
}
