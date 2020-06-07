import * as tf from '@tensorflow/tfjs';

/**
 * x*y + 0.01 * ((1/2) * y ** 2 - 1/4 * y ** 4)
 * @param x, y
 */
export const unstableGame = (x, y) => {
  return tf.tidy(() => {
    const epsilon = tf.scalar(0.01);
    const half = tf.scalar(1/2);
    const quarter = tf.scalar(1/4);
    return x.mul(y).add(epsilon.mul(
      half.mul(y.pow(2)).sub(quarter.mul(y.pow(4)))
    ));
  });
}
