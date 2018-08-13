/**
 * Build config for electron 'Renderer Process' file
 */

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: 'cheap-module-source-map',

  entry: {
    bundle: [
      '@babel/polyfill',
      './src/index'
    ],
  },

  output: {
    path: path.join(__dirname, 'app/dist'),
    publicPath: '../dist/'
  },

  module: {
    rules: [
      // Images
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        loader: 'url-loader'
      }
    ]
  },

  plugins: [
    // NODE_ENV should be production so that modules do not perform certain development checks
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true
    }),
  ],

  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer'
})
