import React from 'react';
import Plot from 'react-plotly.js';
import { fromJS } from 'immutable';
import * as tf from '@tensorflow/tfjs';
import { Remote, proxy, wrap } from 'comlink';

import { unstableGame } from './games';
import RunnerWorker from './runner.worker';


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

// Update smoothly... 
// select learning rate
// select method

class App extends React.Component<{}, AppState> {
  workerApi: Remote<import('./runner.worker').RunnerWorker>;

  constructor(props) {
    super(props);
    const worker = new RunnerWorker();
    this.workerApi = wrap<import('./runner.worker').RunnerWorker>(worker);

    this.state = { 
      uuid: null,
      data: this._initTrajectory([1, 1.5], [1, 1.5]),
      layout: {
        hovermode: true,
        dragmode: "zoom",
        xaxis: {fixedrange: true, title: {text: "x1"}},
        yaxis: {fixedrange: true, title: {text: "x2"}},
        showlegend: false,
        clickmode: "event",
        width: 720, 
        height: 500, 
      },
      frames: [], 
      config: {
        displayModeBar: false,
        scrollZoom: false,
        displaylogo: false,
      } 
    };
  }

  updateTrajectory = (x, y, uuid) => {
    // Don't update if uuid has been set and it's not the same.
    if ((this.state.uuid != null) && (this.state.uuid != uuid)) {
      return;
    }
    // only update if uuid is null or 
    const data = this.state.data;
    const updatedData = data
      .updateIn([1, 'x'], list => list.push(x))
      .updateIn([1, 'y'], list => list.push(y));
    this.setState({
      uuid: uuid,
      data: updatedData
    });
  }

  runFrom = async (x, y) => {
    // TODO: stop the previous (by setting uuid to 0).
    this.setState({uuid: null, data: this._initTrajectory([x], [y])});
    await this.workerApi.run(x, y, 0.01, 100, proxy(this.updateTrajectory));
  }

  _initTrajectory = (x, y) => {
    return fromJS([
      contourConfig,
      {
        x: x,
        y: x,
        type: 'scatter',
        mode: 'lines',
        line: {color: 'red'},
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

export default App;
