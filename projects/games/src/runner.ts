import * as tf from '@tensorflow/tfjs';
import { gameDict } from './games';

export enum OptimizerTypes {
  Adam = 'Adam',
  SGD = 'SGD',
  Momentum = 'Momentum',
  // OGDA = 'OGDA',
  // EG = 'EG'
}

export function* run(
  x_init:number = 1,
  y_init:number = 1,
  gameType:string = 'unstableGame',
  lr:number = 0.01, 
  T:number = 0,
  optimizer = OptimizerTypes.Adam) {

  // Global cleanup
  tf.disposeVariables();

  const game = new gameDict[gameType]();

  console.log("worker", x_init, y_init);
  const x1 = tf.tensor([x_init]).variable();
  const x2 = tf.tensor([y_init]).variable();

  let optimizer_x1, optimizer_x2;
  if (optimizer == OptimizerTypes.Adam) {
    optimizer_x1 = tf.train.adam(lr);
    optimizer_x2 = tf.train.adam(lr);
  } else if (optimizer == OptimizerTypes.Momentum) {
    let mom = 0.9
    optimizer_x1 = tf.train.momentum(lr, mom, false);
    optimizer_x2 = tf.train.momentum(lr, mom, false);  
  } else if (optimizer == OptimizerTypes.OGDA) {
    let mom = 0.9
    optimizer_x1 = tf.train.momentum(lr, mom);
    optimizer_x2 = tf.train.momentum(lr, mom);  
  } else if (optimizer == OptimizerTypes.EG) {
    let mom = 0.9
    optimizer_x1 = tf.train.momentum(lr, mom);
    optimizer_x2 = tf.train.momentum(lr, mom);  
  } else if (optimizer == OptimizerTypes.SGD) {
    optimizer_x1 = tf.train.sgd(lr);
    optimizer_x2 = tf.train.sgd(lr);  
  } else {
    throw new Error("Not a supported optimizer")
  }

  for (let i = 0; i < T; i++) {
    optimizer_x1.minimize(() => game.f(x1, x2).asScalar(), true, [x1]);
    optimizer_x2.minimize(() => tf.neg(game.f(x1, x2)).asScalar(), true, [x2]);
    // console.log("worker", x1.asScalar().arraySync(), x2.asScalar().arraySync());
    yield {
      x: x1.asScalar().arraySync(), 
      y: x2.asScalar().arraySync(),
    };
  }
}
