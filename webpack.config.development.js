/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')

const port = process.env.PORT || 3001

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',

  entry: {
    bundle: [
      // 'react-hot-loader/patch', CAUSE PROBLEMS IN REACT LIFECYCLES
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
      '@babel/polyfill',
      './src/index'
    ],
  },

  output: {
    publicPath: `http://localhost:${port}/dist/`
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),

    // “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
    // https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
    new webpack.NoEmitOnErrorsPlugin(),
  ],

  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer'
})
