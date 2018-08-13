/**
 * Base webpack config used across other specific configs
 */

const path = require('path')

const ROOT_FOLDER = __dirname
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')

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
    filename: '[name].js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    alias: {
      'ui-framework': path.join(SRC_FOLDER, 'ui-framework'),
      'app-utils': path.join(SRC_FOLDER, 'application', 'utils'),
      'app-services': path.join(SRC_FOLDER, 'application', 'services'),
      'app-images': path.join(SRC_FOLDER, 'images'),
      'shared-components': path.join(SRC_FOLDER, 'application', 'shared-components'),
    },

    extensions: ['.js', '.jsx', '.json'],
    mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [],
}
