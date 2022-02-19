import * as d3 from 'd3';
import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';

import copyToClipboard from 'copy-to-clipboard';
import { gameDict } from './games';
import { OptimizerTypes } from './runner';
import { optimizerTypeCheckboxes, colors } from './optimizerTypeCheckboxes';
import { WorkerManager } from './WorkerManager';
import { Trajectory } from './Trajectory';
import { Storage } from "./Storage";
import { uuidv4 } from './uuid';

export interface GameState {
  gameType: string;
  optimizerTypes: OptimizerTypes[];
  lr: number;
}

export interface GameDisplaySetting {
  interactive: boolean;
  showAxes: boolean;
}

export class GamePlot {
  interactive: boolean;
  displaySetting: GameDisplaySetting;
  state: GameState;
  storage: Storage;
  workerManager: WorkerManager;
  svg: any;
  width: number;
  height: number;
  updateInterval: number;
  x: any;
  y: any;
  constructor(state: GameState, storage: Storage, displaySetting: GameDisplaySetting = {interactive: true, showAxes: true}) {
    this.state = state;
    this.displaySetting = displaySetting;
    this.storage = storage;
    this.workerManager = new WorkerManager(this);
    this.updateInterval = 500;
    this.width = 500;
    this.height = 300;
    this.svg = d3.create("svg")
      .attr("viewBox", `${[0, 0, this.width, this.height]}`)
      .style("display", "block")
      .style("cursor", 'pointer')
      .style("margin", "0")
      .style("margin-bottom", "1em");
    this.svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.05);
    const that = this;
    this.svg.on('click', function () {
      const mouse = d3.mouse(this);
      that.onClick(mouse);
    });
  }
  invertPoint = ([x_, y_]) => ([this.x.invert(x_), this.y.invert(y_)]);
  drawStartPoint(x, y) {
    let color = 'black';
    if (this.state.optimizerTypes.length == 1) {
      color = colors[this.state.optimizerTypes[0]];
    }
    const circle = this.svg.append("circle")
      .attr("class", "trajectory")
      .attr("cx", x)
      .attr("cy", y)
      .style("fill", color)
      .attr("r", 8)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1)
      .ease(d3.easeExpIn)
      .attr("r", 3);
  }
  onClick = (mouse) => {
    // Clean up previous paths 
    this.svg.selectAll(".trajectory").remove();
    const [x, y] = this.invertPoint(mouse);
    console.log([x, y]);
    // make initial animation
    this.drawStartPoint(mouse[0], mouse[1]);
    this.workerManager.start(x, y);
  };
  stop = () => {
    this.workerManager.freeze();
    // this.svg.selectAll('.trajectory').remove();
  };
  reset = () => {
    this.stop();
    this.svg.selectAll("*").remove();
  };
  drawContour = () => {
    const game = new gameDict[this.state.gameType]();
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
    const yLin = tf.linspace(2, -2, h); // draw reverse because SVG draws mirrored
    const xx = tf.matMul(tf.ones([h, 1]), xLin.reshape([1, w])).flatten();
    const yy = tf.matMul(yLin.reshape([h, 1]), tf.ones([1, w])).flatten();
    const zz = game.f(xx, yy);
    const gridArr = zz.arraySync();
    const start = Math.min(...gridArr);
    const end = Math.max(...gridArr);
    const interval = Math.abs(end - start);
    const numContourLines = 20;
    const size = interval / numContourLines;
    const grid = {
      k: q,
      n: w,
      m: h,
    };
    const thresholds = d3.range(start, end, size);
    const color = d3.scaleSequential(d3.extent(thresholds), d3.interpolateViridis);
    // Converts from grid coordinates (indexes) to screen coordinates (pixels).
    const transformPoint = ([x, y]) => ([
      grid.k * x,
      grid.k * y
    ]);
    const transform = ({ type, value, coordinates }) => {
      return {
        type, value, coordinates: coordinates.map(rings => {
          return rings.map(points => {
            return points.map(transformPoint);
          });
        })
      };
    };
    console.log(grid);
    const contours = d3.contours()
      .size([grid.n, grid.m])
      .thresholds(thresholds)(gridArr)
      .map(transform);
    svg
      .selectAll("path")
      .data(contours)
      .join("path")
      .attr("fill", d => color(d.value))
      .attr("d", d3.geoPath());
    svg.append("circle")
      .attr("cx", x(game.criticalPoint[0]))
      .attr("cy", y(game.criticalPoint[1]))
      .style("fill", 'black')
      .attr("r", 5);

    if (this.displaySetting.showAxes) {
      svg.append("g").call(xAxis);
      svg.append("g").call(yAxis);
    }
  };
  share = () => {
    const ts: Trajectory[] = Object.values(this.workerManager.workers).map(([r, w, t]) => t);
    const shareUrl = this.storage.write(this.state, ts);
    copyToClipboard(shareUrl);
  };
  drawTrajectories(trajectories: Trajectory[]) {
    if (trajectories.length >= 1) {
      const x = trajectories[0].history[0].x;
      const y = trajectories[0].history[0].y;
      this.drawStartPoint(this.x(x), this.y(y));
    }
    trajectories.forEach(t => {
      const xs = t.history.map(p => p.x);
      const ys = t.history.map(p => p.y);
      t.history = [];
      t.prevPoint = [xs[0], ys[0]];
      t.gameplot = this;
      t.update(xs, ys, 5000);
    });
  }
  render(selector) {
    const that = this;
    const root = d3.select(selector);
    root.node().appendChild(this.svg.node());
    // Draw contour
    this.drawContour();

    if (!this.displaySetting.interactive) {
      return;
    }

    // Container for controllers
    const controllers = root.append('div').attr('class', 'controllers');
    // Checkbox
    const checkboxes = optimizerTypeCheckboxes(this.state.optimizerTypes, (optimizerTypes) => {
      that.state.optimizerTypes = optimizerTypes;
    });
    controllers.node().appendChild(checkboxes.node());
    // Game type selector
    let id_ = `${uuidv4()}`;
    const gameTypeContainer = controllers.append('div')
      .attr('class', 'input-container');
    gameTypeContainer.append('label')
    .attr('for', id_)
    .text('Game');
    const gameTypeSelect = gameTypeContainer.append('select')
      .attr('id', id_);
    gameTypeSelect
      .selectAll()
      .data(Object.keys(gameDict))
      .enter()
      .append('option')
      .text(d => d)
      .attr("value", d => d);
    gameTypeSelect.property('value', this.state.gameType);
    // Step size input
    id_ = `${uuidv4()}`;
    const LrContainer = controllers.append('div')
      .attr('class', 'input-container');
    LrContainer.append('label')
      .attr('for', id_)
      .text('Step size');
    const LrInput = LrContainer.append('input');
    LrInput.attr('type', 'number')
      .attr('value', this.state.lr)
      .attr('id', id_)
      .attr('step', '0.01')
      .attr('min', '0.0')
      .attr('max', '1.0');
    // Stop button
    const stopButton = controllers.append('button');
    stopButton.text('Stop');
    // Share button
    const shareButton = controllers.append('div')
      .attr('class', 'tooltip')
      .text('Share');
    shareButton.append('span')
      .attr('class', 'tooltiptext')
      .text('Copy shareable link to clipboard');
    shareButton.append('span')
      .attr('class', 'tooltiptext--success')
      .text('Copied to clipboard!');
    // Event listeners
    gameTypeSelect.on("change", function (d) {
      that.state.gameType = this.options[this.selectedIndex].value;
      that.drawContour();
    });
    LrInput.on("input", function () {
      that.state.lr = Number(this.value);
    });
    shareButton.on('click', () => {
      this.share();
      shareButton.node().classList.add('clicked');
      setTimeout(() => shareButton.node().classList.remove('clicked'), 2000);
    });

    stopButton.on('click', this.stop);
  }
}
