const path = require('path');

// const isProduction = typeof NODE_ENV !== 'undefined' && NODE_ENV === 'production';
// const mode = isProduction ? 'production' : 'development';
const mode = 'production';
const devtool = mode == 'production' ? false : 'cheap-source-map';
const workerOptions = mode == 'production' ? { publicPath: '/projects/games/dist/', } : {};

module.exports = {
  entry: {
    app: './src/index.tsx',
    // vendor: ['react', 'react-dom']
  },
  mode,
  devtool: false,
  module: {
    rules: [
      {
        test: /\.worker\.(js|ts)$/i,
        use: { 
          loader: 'worker-loader',
          options: workerOptions,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.scss' ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
  },
};
