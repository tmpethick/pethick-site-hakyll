// import * as React from "react";
// import * as ReactDOM from "react-dom";

import * as d3 from 'd3';
import { Remote, proxy, wrap } from 'comlink';
import * as tf from '@tensorflow/tfjs';

import { gameDict, stableGame, unstableGame } from './games';
import { OptimizerTypes } from './runner';
import RunnerWorker from './runner.worker';
import { uuidv4 } from './uuid';


const zip = rows => rows[0].map((_,c) => rows.map(row => row[c]));
const colors = {
  [OptimizerTypes.Adam]: 'red',
  [OptimizerTypes.SGD]: 'blue',
};

class WorkerManager {
  gameplot: GamePlot;
  workers: Record<string,[Worker,Trajectory]>;
  
  constructor(owner) {
    this.gameplot = owner;
    this.workers = {};
  }
  
  stop() {
    for (const [worker, trajectory] of Object.values(this.workers)) {
      if (worker != null) worker.terminate();
    }
    this.workers = {};
  }
  
  start(x, y) {
    this.stop();
    this.gameplot.optimizerTypes.forEach(optimizerType => {
      console.log(`Starting ${optimizerType}`)
      const uuid = uuidv4();
      const worker = new RunnerWorker();
      const trajectory = new Trajectory(colors[optimizerType], [x,y],this.gameplot);
      this.workers[uuid] = [worker, trajectory];
      
      const workerApi = wrap<import('./runner.worker').RunnerWorker>(worker);
      workerApi.run(x, y, this.gameplot.gameType, optimizerType, this.gameplot.lr, 10000, this.gameplot.updateInterval, proxy(this.callback), uuid);
    });
  }

  callback = (xs, ys, uuid) => {
    if (this.workers.hasOwnProperty(uuid)) {
      const [worker, trajectory] = this.workers[uuid];
      trajectory.update(xs, ys);
    }
  }
}


class Trajectory {
  gameplot: GamePlot;
  color: string;
  prevPoint: [number, number];

  constructor(color, startPoint, gameplot) {
    this.color = color;
    this.prevPoint = startPoint;
    this.gameplot = gameplot;
  }

  update = (xs, ys) => {
    xs.unshift(this.prevPoint[0]);
    ys.unshift(this.prevPoint[1]);
    this.prevPoint = [xs[xs.length - 1], ys[ys.length - 1]];
  
    const dataStrip = zip([xs, ys]);
    const line = d3.line()
      .x(d => this.gameplot.x(d[0]))
      .y(d => this.gameplot.y(d[1]))
      .curve(d3.curveNatural)
    
    const path = this.gameplot.svg.append("path")
      .attr("class", "trajectory")
      .attr("d", line(dataStrip))
      .attr("stroke", color)
      .attr("stroke-width", "2")
      .attr("fill", "none");
    
    const totalLength = path.node().getTotalLength();
    
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(this.gameplot.updateInterval)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
  }
}

class GamePlot {
  workerManager: WorkerManager;
  gameType: string;
  optimizerTypes: OptimizerTypes[];
  lr: number;

  svg: any;
  width: number;
  height: number;
  updateInterval: number;
  
  x: any;
  y: any;

  constructor (gameType, lr=0.01, optimizerTypes=[OptimizerTypes.Adam, OptimizerTypes.SGD]) {
    this.gameType = gameType;
    this.lr = lr;
    this.optimizerTypes = optimizerTypes;
    this.workerManager = new WorkerManager(this);
    this.updateInterval = 500;
    this.width = 500;
    this.height = 300;
    
    this.svg = d3.create("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .style("display", "block")
      .style("cursor", 'pointer')
      .style("margin", "0 -14px");

    this.svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.05)

    const that = this;
    this.svg.on('click', function () {
      const mouse = d3.mouse(this);
      that.onClick(mouse);
    });

  }

  invertPoint = ([x_,y_]) => ([this.x.invert(x_), this.y.invert(y_)]);

  onClick = (mouse) => {
    // Clean up previous paths 
    this.svg.selectAll(".trajectory").remove();
    
    const [x,y] = this.invertPoint(mouse);
    console.log([x, y]);

    // make initial animation
    const circle = this.svg.append("circle")
      .attr("class", "trajectory")
      .attr("cx", mouse[0])
      .attr("cy", mouse[1])
      .style("fill", "red")
      .attr("r",8)
      .style("opacity", 0)
      .transition()
        .duration(500)
        .style("opacity", 1)
        .ease(d3.easeExpIn)
        .attr("r", 3)

    this.workerManager.start(x, y);
  }

  stop = () => {
    this.workerManager.stop();
    this.svg.selectAll('.trajectory').remove();
  }

  reset = () => {
    this.stop();
    this.svg.selectAll("*").remove();
  }

  drawContour = () => {
    const gameF = gameDict[this.gameType];

    // Clean a potential worker
    this.reset();

    const svg = this.svg;
      
    this.x = d3.scaleLinear([-2, 2], [0, this.width]);
    this.y = d3.scaleLinear([-2, 2], [this.height, 0]);
    const x = this.x;
    const y = this.y;
    
    const xAxis = g => g
        .attr("transform", `translate(0,${this.height})`)
        .call(d3.axisTop(x).ticks(this.width / this.height * 10))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick").filter(d => x.domain().includes(d)).remove());
    
    const yAxis = g => g
        .attr("transform", "translate(-1,0)")
        .call(d3.axisRight(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick").filter(d => y.domain().includes(d)).remove());
    
    const q = 10; // The level of detail, e.g., sample every 4 pixels in x and y.
    const w = Math.ceil(this.width / q);
    const h = Math.ceil(this.height / q);
    const xLin = tf.linspace(-2, 2, w);
    const yLin = tf.linspace(-2, 2, h);
    const xx = tf.matMul( tf.ones  ([h, 1]), xLin.reshape([1, w])).flatten();
    const yy = tf.matMul( yLin.reshape([h, 1]), tf.ones  ([1, w])).flatten();
    const zz = gameF(xx, yy);
    const gridArr = zz.arraySync();
    const start = Math.min(...gridArr);
    const end = Math.max(...gridArr);
    const interval = Math.abs(end - start);
    const numContourLines = 20;
    const size = interval / numContourLines;
    const grid = {
      x: -q,
      y: -q,
      k: q,
      n: w,
      m: h,
    }
    const thresholds = d3.range(start, end, size);
    const color = d3.scaleSequential(d3.extent(thresholds), d3.interpolateViridis);
    
    // Converts from grid coordinates (indexes) to screen coordinates (pixels).
    const transformPoint = ([x, y]) => ([
      grid.x + grid.k * x,
      grid.y + grid.k * y
    ]);
    const transform = ({type, value, coordinates}) => {
      return {type, value, coordinates: coordinates.map(rings => {
        return rings.map(points => {
          return points.map(transformPoint);
        });
      })};
    };
    console.log(grid)
    
    const contours = d3.contours()
        .size([grid.n, grid.m])
        .thresholds(thresholds)
      (gridArr)
        .map(transform);
    
    svg    
      .selectAll("path")
      .data(contours)
      .join("path")
        .attr("fill", d => color(d.value))
        .attr("d", d3.geoPath())
    
    svg.append("g")
        .call(xAxis)
        .attr("transform", "translate(0," + (this.height - 10) + ")")
    
    svg.append("g")
        .call(yAxis);    
  }
  
  render(selector) {
    const root = d3.select(selector);
    root.node().append(this.svg.node());

    const gameTypeSelect = root.append('select');
    gameTypeSelect
      .selectAll('myOptions')
      .data(Object.keys(gameDict))
      .enter()
      .append('option')
      .text(d => d)
      .attr("value", d => d);
    gameTypeSelect.property('value', this.gameType)
  
    const LrInput = root.append('input');
    LrInput.attr('type', 'number')
      .attr('value', this.lr)
      .attr('step', '0.01')
      .attr('min', '0.0')
      .attr('max', '1.0');

    const stopButton = root.append('button')
    stopButton.text('Stop');

    // Event listeners
    const that = this;
    gameTypeSelect.on("change", function(d) {
      that.gameType = this.options[this.selectedIndex].value;
      that.drawContour();
    });

    LrInput.on("input", function() {
      that.lr = Number(this.value);
    });

    stopButton.on('click', this.stop);
  }
}

const gameType = "unstableGame";
const gp = new GamePlot(gameType);
gp.drawContour();
gp.render('#contour');


// TODO: 
// update environment √ 
  // clear currently running trajectory if any √
// update learning rate √
// choose methods
  // run multiple methods
// Stop button √
// Fix mirrored contour
// Add center/optimum
// Generate all selectors inside class (remove from html)

// TODO:
// Fix overlapping Axis
// Fix overflowing borders
// Fix weird corner
// Fix trajectory connecting wierdly
// Fix trajectory lacking connection
