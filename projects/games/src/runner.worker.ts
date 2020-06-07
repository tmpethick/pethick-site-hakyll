import { expose } from 'comlink';
import { run as runOptimizer } from './runner';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const shouldRunState = {};

const run = async (
    x_init = 1,
    y_init = 1,
    lr:number = 0.01, 
    T:number = 0, 
    callback=(x:number, y:number, uuid:string) => {}) => {

  // Stop all other currently running processes.
  Object.keys(shouldRunState).forEach(uuid => shouldRunState[uuid] = false);

  const uuid = uuidv4();
  shouldRunState[uuid] = true;

  for (const point of runOptimizer(x_init, y_init, lr, T)) {
    if (Boolean(shouldRunState[uuid])) {
      callback(point.x, point.y, uuid);
    } else {
      // Exit if stopped by another process and clean up after itself.
      delete shouldRunState[uuid];
      break;
    }
  }
  delete shouldRunState[uuid];
}

const runnerWorker = {
  run: run
}

// Make available the interface
export type RunnerWorker = typeof runnerWorker;

// Use comlink to expose a postMessage interface as WebWorker expects.
expose(runnerWorker);

// Trickery to fix TypeScript since this will be done by "worker-loader"
export default {} as typeof Worker & (new () => Worker);
