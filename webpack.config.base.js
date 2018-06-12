/**
 * Base webpack config used across other specific configs
 */

const path = require('path')
const appPackage = require('./app/package')
const externals = appPackage.dependencies

const ROOT_FOLDER = __dirname
const APP_FOLDER = path.join(ROOT_FOLDER, 'app')

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /.*images.+\.svg$/,
        loader: 'url-loader',
      },
      {
        test: /.*svg-sprite.+\.svg$/,
        loader: 'svg-sprite-loader',
        // options: {extract: true}
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
      'ui-framework': path.join(APP_FOLDER, 'ui-framework'),
      'app-utils': path.join(APP_FOLDER, 'application', 'utils'),
      'app-services': path.join(APP_FOLDER, 'application', 'services'),
      'app-images': path.join(APP_FOLDER, 'images'),
      'shared-components': path.join(APP_FOLDER, 'application', 'shared-components'),
    },

    extensions: ['.js', '.jsx', '.json'],
    mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [],

  externals: Object.keys(externals || {})
}
