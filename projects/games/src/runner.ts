import * as tf from '@tensorflow/tfjs';
import { unstableGame } from './games';

export enum OptimizerTypes {
  Adam,
  SGD,
}

export function* run(
  x_init:number = 1,
  y_init:number = 1,
  lr:number = 0.01, 
  T:number = 0,
  optimizer = OptimizerTypes.Adam) {

  // Global cleanup
  tf.disposeVariables();

  console.log("worker", x_init, y_init);
  const x1 = tf.tensor([x_init]).variable();
  const x2 = tf.tensor([y_init]).variable();

  let optimizer_x1, optimizer_x2;
  if (optimizer == OptimizerTypes.Adam) {
    optimizer_x1 = tf.train.adam(lr);
    optimizer_x2 = tf.train.adam(lr);
  } else {
    optimizer_x1 = tf.train.sgd(lr);
    optimizer_x2 = tf.train.sgd(lr);
  }

  for (let i = 0; i < T; i++) {
    optimizer_x1.minimize(() => unstableGame(x1, x2).asScalar(), true, [x1]);
    optimizer_x2.minimize(() => tf.neg(unstableGame(x1, x2)).asScalar(), true, [x2]);
    // console.log("worker", x1.asScalar().arraySync(), x2.asScalar().arraySync());
    yield {
      x: x1.asScalar().arraySync(), 
      y: x2.asScalar().arraySync(),
    };
  }
}
