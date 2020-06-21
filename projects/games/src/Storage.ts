import * as _ from 'lodash';
import simplify from 'simplify-js';
import LZString from 'lz-string';

import { flattened } from './functional';
import { colors } from './optimizerTypeCheckboxes';
import { Point, Trajectory } from './Trajectory';


export class Storage {
  compressPath = (path: Point[]) => {
    // shorten the path and store it as a string.
    const degreeOfDetail = 0.001;
    const numDigits = 3;
    // const trajectorySimplified = path;
    const trajectorySimplified = simplify(path, degreeOfDetail);
    console.log('trajectory length:', trajectorySimplified.length);
    const str = flattened(trajectorySimplified.map(p => [p.x.toFixed(numDigits), p.y.toFixed(numDigits)])).join(',');
    return str;
  };
  decompressPath = (path: string) => {
    // TODO: pick every second
    const arr = path.split(',').map(x => +x);
    const pairArr: number[][] = _.chunk(arr, 2);
    return pairArr.map(([x, y]) => ({ 'x': x, 'y': y }));
  };
  compressTrajectory = (trajectory: Trajectory) => ({
    'o': trajectory.optimizerType,
    'h': this.compressPath(trajectory.history),
  });
  decompressTrajectory = (t) => {
    console.log(t);
    const history = _.cloneDeep(this.decompressPath(t.h));
    const trajectory = new Trajectory(t.o, colors[t.o], null, null, history);
    return trajectory;
  };
  write = (state, trajectories) => {
    const compressedTrajectories = trajectories.map(this.compressTrajectory);
    const stateJSON = JSON.stringify(state);
    const compressedTrajectoriesJSON = JSON.stringify(compressedTrajectories);
    const str = [stateJSON, compressedTrajectoriesJSON].join('|');
    let strCompressed = LZString.compressToEncodedURIComponent(str);
    const url = window.location.href.split('?');
    const shareUrl = url[0] + '?' + strCompressed;
    return shareUrl;
  };
  read = (shareUrl) => {
    let raw = shareUrl;
    raw = raw.substr(1); // remove "?"
    raw = LZString.decompressFromEncodedURIComponent(raw);
    const [stateJSON, compressedTrajectoriesJSON] = raw.split('|');
    const [state, compressedTrajectories] = [JSON.parse(stateJSON), JSON.parse(compressedTrajectoriesJSON)];
    const trajectories = compressedTrajectories.map(this.decompressTrajectory);
    return [state, trajectories];
  };
}
