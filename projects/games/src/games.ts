import * as tf from '@tensorflow/tfjs';

interface Game {
  criticalPoint: number[];
  f: (x: number, y: number) => tf.Scalar;
}

export class UnstableGame implements Game {
  criticalPoint = [0, 0];
  
  f = (x,y) => {
    // x*y + 0.01 * ((1/2) * y ** 2 - 1/4 * y ** 4)
    return tf.tidy(() => {
      const epsilon = tf.scalar(0.01);
      const half = tf.scalar(1/2);
      const quarter = tf.scalar(1/4);
      return x.mul(y).add(epsilon.mul(
        half.mul(y.pow(2)).sub(quarter.mul(y.pow(4)))
      ));
    });
  }
}

const phi = (z) => {
  return tf.tidy(() => {
    const half = tf.scalar(1/2);
    const quarter = tf.scalar(1/4);
    const sixth = tf.scalar(1/6);
    return quarter.mul(z.pow(2)).sub(half.mul(z.pow(4))).add(sixth.mul(z.pow(6)));
  });
}

export class StableGame implements Game {
  criticalPoint = [0, 0.5];
  
  f = (x,y) => {
    // x * (y - 0.5) + phi(x) - phi(y)
    return tf.tidy(() => {
      return x.mul(y.sub(0.5)).add(phi(x)).sub(phi(y));
    });
  }
}

export class Bilinear implements Game {
  criticalPoint = [0, 0];
  
  f = (x,y) => {
    // x * (y - 0.5) + phi(x) - phi(y)
    return tf.tidy(() => {
      return x.mul(y);
    });
  }
}
  
export const gameDict = {
  "stableGame": StableGame,
  "unstableGame": UnstableGame,
  "bilinear": Bilinear
}
