const path = require('path');

// const isProduction = typeof NODE_ENV !== 'undefined' && NODE_ENV === 'production';
// const mode = isProduction ? 'production' : 'development';
const mode = 'development';
const devtool = mode == 'production' ? false : 'cheap-source-map';

module.exports = {
  entry: {
    app: './src/index.tsx',
    vendor: ['react', 'react-dom']
  },
  mode,
  devtool: false,
  module: {
    rules: [
      {
        test: /\.worker\.(js|ts)$/i,
        use: 'worker-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
  },
};
