import { Remote } from 'comlink';

import { OptimizerTypes } from './runner';
import { inView, runWhenInViewport } from './viewport';
import { GamePlot } from './GamePlot';
import { Storage } from './Storage';

import './styles/index.scss';


// Get state from URI if there
const storage = new Storage();
let urlState = null;
try {
  urlState = storage.read(window.location.search);
} catch(err) {
  console.log(err);
}

if (urlState != null) {
  const [state, trajectories] = urlState;
  const gp = new GamePlot(state, storage);
  gp.render('#contour');

  const element = document.querySelector('#contour');
  runWhenInViewport(element, () => gp.drawTrajectories(trajectories));
} else {
  const state = {
    gameType: "unstableGame",
    lr: 0.01,
    optimizerTypes: Object.values(OptimizerTypes)
  }
  const gp = new GamePlot(state, storage);
  gp.render('#contour');
}



// TODO: 
// update environment √ 
  // clear currently running trajectory if any √
// update learning rate √
// run multiple methods √
// Stop button √
// choose methods √ 
// Add center/optimum √
// Fix mirrored contour √√
// Initial trajectory √√
// Generate all selectors inside class (remove from html) √
// Fix overlapping Axis √
// Fix overflowing borders √
// make path sharable (reduce number of points, create sharable link)
  // simplify path (d3? round intergers)
  // change and read URL
// Other methods (LD, CGD)
// Fix firefox runner



// Narrative:
// Show bilinear game
// Show when shielded
// Add weird case for GD on stableGame at the end
