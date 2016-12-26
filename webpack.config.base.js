/**
 * Base webpack config used across other specific configs
 */

import path from 'path'
import {dependencies as externals} from './app/package'

const ROOT_FOLDER = __dirname
const APP_FOLDER = path.join(ROOT_FOLDER, 'app')

export default {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    alias: {
      'UI': path.join(APP_FOLDER, 'framework')
    },
    modules: [
      path.join(__dirname, 'node_modules')
    ],
    extensions: ['.js', '.jsx', '.json'],
    mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [],

  externals: Object.keys(externals || {})
}
