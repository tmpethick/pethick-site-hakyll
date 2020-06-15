# Games


## Hickups

Tensorflow.js does not allow stacking variable while still keeping track of them.
When that becomes possible we should rather refactor into:

```ts
// Combining
const X = tf.stack([x1, x2], 1);

// Splitting again
const x = X.slice([0,0], [-1, 1]).as1D();
const y = X.slice([0,1], [-1, 2]).as1D();
```

## TODO

- [x] Implement functions
- [x] Training loop
- [ ] Plot contour plot
- [ ] Plot trajectory
- [ ] Update trajectory


## Resources

- [Tensorflow.js documentation](https://js.tensorflow.org/api/latest/)
- Plotlyjs https://github.com/plotly/react-plotly.js/blob/master/README.md
  - Styling the contour: https://chart-studio.plotly.com/create/?fid=plotly2_demo:411#/
- WebWorkers: 
  - https://blog.johnnyreilly.com/2020/02/web-workers-comlink-typescript-and-react.html
  - https://github.com/GoogleChromeLabs/comlink
  - https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
- Animation 
  - https://bl.ocks.org/basilesimon/f164aec5758d16d51d248e41af5428e4
  - https://observablehq.com/@d3/connected-scatterplot
- Contour 
  - https://observablehq.com/@d3/contours?collection=@d3/d3-contour
