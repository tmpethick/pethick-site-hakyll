import { expose } from 'comlink';
import { run as runOptimizer } from './runner';
import { uuidv4 } from './uuid';

let currentRunner: RunnerState = null;
const runners: Record<string, RunnerState> = {};

class RunnerState {
  uuid: string;
  shouldRun: boolean;
  xs: number[];
  ys: number[];
  i: number;

  constructor (uuid?: string) {
    this.uuid = uuid || uuidv4();
    this.shouldRun = true;
    this.xs = [];
    this.ys = [];
    this.i = 0;
  }

  incIndexWith = (j: number) => {
    this.i = this.i + j;
  }

  flush = () => {
    let xsTail = this.xs.slice(this.i);
    let ysTail = this.ys.slice(this.i);
    this.incIndexWith(xsTail.length);
    return [xsTail, ysTail];
  }
}

/**
 * Retrieve the State of the most recent runner.
 * It will flush and return the buffer being stored.
 */
const getState = async () => {
  console.log("receved!");
  if (currentRunner == null) {
    return { xs: [], ys: [], uuid: null };
  }
  const [xsTail, ysTail] = currentRunner.flush();
  return { xs: xsTail, ys: ysTail, uuid: currentRunner.uuid };
}

const run = async (
    x_init = 1,
    y_init = 1,
    lr:number = 0.01, 
    T:number = 0,
    updateInterval: number = 500,
    callback = (x,y,uuid) => {},
    externalUuid?:string = null) => 
{

  // Stop all other currently running processes.
  Object.keys(runners).forEach(uuid => runners[uuid].shouldRun = false);
  
  // Create new runner
  const runner = new RunnerState(externalUuid);
  const uuid = runner.uuid;
  runners[runner.uuid] = runner;
  currentRunner = runner;

  // Start the optimization
  let i = 0;
  let prevTimestamp = Date.now();
  for (const point of runOptimizer(x_init, y_init, lr, T)) {
    if (runner.shouldRun) {
      runner.xs.push(point.x);
      runner.ys.push(point.y);
    } else {
      // Exit if stopped by another process and clean up after itself.
      delete runners[uuid];
      break;
    }
    let timestamp = Date.now();
    if (timestamp - prevTimestamp > updateInterval) {
      const [xsTail, ysTail] = currentRunner.flush();
      callback(xsTail, ysTail, currentRunner.uuid);
      prevTimestamp = timestamp;
    }
  }

  // cleanup
  currentRunner = null;
  runner.shouldRun = false;
  delete runners[uuid];
  return {xs: runner.xs, ys: runner.ys, uuid: runner.uuid};
}

const runnerWorker = {
  getState,
  run
}

// Make available the interface
export type RunnerWorker = typeof runnerWorker;

// Use comlink to expose a postMessage interface as WebWorker expects.
expose(runnerWorker);

// Trickery to fix TypeScript since this will be done by "worker-loader"
export default {} as typeof Worker & (new () => Worker);
