/**
 * Build config for electron 'Main Process' file
 */

const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const appPackage = require('./app/package')
const externals = Object.keys(appPackage.dependencies || {})

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: ['./app/main/main.js'],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/
      },
    ]
  },

  output: {
    path: path.join(__dirname, 'app', 'main'),
    filename: 'main.dist.js',
    libraryTarget: 'commonjs2'
  },

  externals,

  plugins: [
    new CleanWebpackPlugin([
      path.join('app', 'main', 'main.dist.*'),
    ]),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],

  /**
   * Set target to Electron specific node.js env.
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-main',

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
}
