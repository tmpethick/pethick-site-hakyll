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
- [x] Plot contour plot
- [x] Plot trajectory
- [x] Update trajectory
- [x] update environment  
  - [x] clear currently running trajectory if any 
- [x] update learning rate 
- [x] run multiple methods 
- [x] Stop button 
- [x] choose methods  
- [x] Add center/optimum 
- [x] Fix mirrored contour 
- [x] Initial trajectory 
- [x] Generate all selectors inside class (remove from html) 
- [x] Fix overlapping Axis 
- [x] Fix overflowing borders 
- [x] make path sharable (reduce number of points, create sharable link) 
  - [x] simplify path (d3? round intergers) 
  - [x] change and read URL 
- [x] Other methods (LD, CGD)
- [] Fix firefox runner

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
- Flexbox
  - https://css-tricks.com/snippets/css/a-guide-to-flexbox/
