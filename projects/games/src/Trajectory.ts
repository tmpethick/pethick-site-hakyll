import * as d3 from 'd3';

import { OptimizerTypes } from './runner';
import { zip } from './functional';
import { GamePlot } from "./GamePlot";


export interface Point {
	x: number;
	y: number;
}


export class Trajectory {
  optimizerType: OptimizerTypes;
  gameplot: GamePlot;
  color: string;
  history: Point[];
  prevPoint: [number, number];
  constructor(optimizerType, color, startPoint, gameplot, history = []) {
    this.optimizerType = optimizerType;
    this.color = color;
    this.prevPoint = startPoint;
    this.gameplot = gameplot;
    this.history = history;
  }
  update = (xs: number[], ys: number[], updateInterval?: number) => {
    updateInterval = updateInterval ? updateInterval : this.gameplot.updateInterval;
    // Append to history
    const histNew = zip([xs, ys]).map(p => ({ x: p[0], y: p[1] }));
    this.history.push(...histNew);
    xs.unshift(this.prevPoint[0]);
    ys.unshift(this.prevPoint[1]);
    this.prevPoint = [xs[xs.length - 1], ys[ys.length - 1]];
    const dataStrip = zip([xs, ys]);
    const line = d3.line()
      .x(d => this.gameplot.x(d[0]))
      .y(d => this.gameplot.y(d[1]))
      .curve(d3.curveNatural);
    const path = this.gameplot.svg.append("path")
      .attr("class", "trajectory")
      .attr("d", line(dataStrip))
      .attr("stroke", this.color)
      .attr("stroke-width", "2")
      .attr("fill", "none");
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(updateInterval)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  };
}
