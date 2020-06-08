import React from 'react';
import Plot from 'react-plotly.js';
import { fromJS } from 'immutable';
import * as tf from '@tensorflow/tfjs';
import { Remote, proxy, wrap } from 'comlink';

import { unstableGame } from './games';
import RunnerWorker from './runner.worker';
import { nextFrame } from '@tensorflow/tfjs';


// grid
const w = 50;
const h = 50;
const x = tf.linspace(-2, 2, w);
const y = tf.linspace(-2, 2, h);
const xx = tf.matMul( tf.ones  ([h, 1]), x.reshape([1, w])).flatten();
const yy = tf.matMul( y.reshape([h, 1]), tf.ones  ([1, w])).flatten();
const zz = unstableGame(xx, yy);

// Persist the contour data for plotly
const zzArray = zz.arraySync();
const start = Math.max(...zzArray);
const end = Math.min(...zzArray);
const interval = Math.abs(start - end);
const numContourLines = 20;
const size = interval / numContourLines;
const contourConfig = {
  x: xx.arraySync(),
  y: yy.arraySync(),
  z: zzArray,
  type: 'contour',
  line:{
    smoothing: 0.95,
    width: 0.1,
  },
  autocontour: false,
  contours: {
    start: Math.max(...zzArray),
    end: Math.min(...zzArray),
    size: size,
  },
  colorscale: 'Viridis',
  colorbar: {
    showticklabels: false
  },
  hoverinfo: 'none', // 'x+y',
  name: 'Landscape'
};

interface AppState {
  uuid: string,
  data: any,
  layout: any,
  frames: any,
  config: any
}


class App extends React.Component<{}, AppState> {
  worker: Worker;
  workerApi: Remote<import('./runner.worker').RunnerWorker>;

  constructor(props) {
    super(props);
    this.worker = new RunnerWorker();
    this.workerApi = wrap<import('./runner.worker').RunnerWorker>(this.worker);

    this.state = { 
      uuid: null,
      data: this._initTrajectory([1, 1.5], [1, 1.5]),
      layout: {
        hovermode: true,
        dragmode: "zoom",
        xaxis: {fixedrange: true, title: {text: "x1"}, range: [-2,2]},
        yaxis: {fixedrange: true, title: {text: "x2"}, range: [-2,2]},
        showlegend: false,
        clickmode: "event",
        width: 720, 
        height: 500, 
        transition: {
          duration: 500,
          easing: 'linear'
        }
      },
      frames: [], 
      config: {
        displayModeBar: false,
        scrollZoom: false,
        displaylogo: false,
      } 
    };
  }

  updateTrajectory = (xs, ys, uuid) => {
    // console.log("app", x, y, uuid);
    // Don't update if uuid has been set and it's not the same.
    if ((this.state.uuid != null) && (this.state.uuid != uuid)) {
      return false;
    }
    // only update if uuid is null or 
    const data = this.state.data;
    const updatedData = data
      .updateIn([1, 'x'], list => list.concat(xs))
      .updateIn([1, 'y'], list => list.concat(ys));
    this.setState({
      uuid: uuid,
      data: updatedData
    });
    return true;
  }

  runFrom = async (x, y) => {
    console.log('app: ',x,y);
    // Stop the previous (by setting uuid to null).
    this.setState({uuid: null, data: this._initTrajectory([x], [y])});
    const updateInterval = 500;

    this.worker.terminate();
    this.worker = new RunnerWorker();
    this.workerApi = wrap<import('./runner.worker').RunnerWorker>(this.worker);
    this.workerApi.run(x, y, 0.01, 1000, updateInterval, proxy(this.updateTrajectory));
    
    // Alt 1
    // while (true) {
    //   await nextFrame();
    //   console.log("!!");
    //   const { xs, ys, uuid } = await this.workerApi.getState();
    //   console.log(xs.length);
    //   const updated = this.updateTrajectory(xs, ys, uuid);
    //   if (!updated) {
    //     console.log("Trajectory is no longer updated.");
    //     break;
    //   }
    // }
  
    // Alt 2
    // const {xs, ys, uuid} = await this.workerApi.run(x, y, 0.01, 1000, proxy(this.updateTrajectory));
    // this.updateTrajectory(xs, ys, uuid);
  }

  _initTrajectory = (x, y) => {
    return fromJS([
      contourConfig,
      {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        line: {color: 'red'}, // simplify: false
        hoverinfo: 'none',
      },
      {
        x: [x[0]],
        y: [y[0]],
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 8,
          color: 'red'
        },
        hoverinfo: 'none',
      }
    ]);
  }

  render() {
    return (
      <Plot
        onClick={(e) => {
          console.log(e);
          const p = e.points[0];
          this.runFrom(p.x, p.y);
        }}
        data={this.state.data.toJS()}
        layout={this.state.layout}
        frames={this.state.frames}
        config={this.state.config}
      />
    );
  }
}

// Make worker return batches of updates at intervals.
// How do we run interval?

// update with timer
// click should stop old Runner (click listener should work rather!)
// prevent overflowing boundaries


export default App;
