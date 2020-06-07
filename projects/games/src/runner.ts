import * as tf from '@tensorflow/tfjs';
import { unstableGame } from './games';


export function* run(
  x_init:number = 1,
  y_init:number = 1,
  lr:number = 0.01, 
  T:number = 0) {

  // Global cleanup
  tf.disposeVariables();

  const x1 = tf.tensor([x_init]).variable();
  const x2 = tf.tensor([y_init]).variable();

  const optimizer_x1 = tf.train.sgd(lr);
  const optimizer_x2 = tf.train.sgd(lr);

  for (let i = 0; i < T; i++) {
    optimizer_x1.minimize(() => unstableGame(x1, x2).asScalar(), true, [x1]);
    optimizer_x2.minimize(() => tf.neg(unstableGame(x1, x2)).asScalar(), true, [x2]);
    yield {
      x: x1.asScalar().arraySync(), 
      y: x2.asScalar().arraySync(),
    };
  }
}
