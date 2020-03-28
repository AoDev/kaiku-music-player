/**
 * Base webpack config used across other specific configs
 */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const ROOT_FOLDER = __dirname
// const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')
const APP_FOLDER = path.join(ROOT_FOLDER, 'app')

const mainContentPolicy = {
  production: "script-src 'self'",
  development: "script-src 'self' 'unsafe-eval'",
}

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
    },
    runtimeChunk: {
      name: 'manifest',
    },
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [
    new CleanWebpackPlugin([
      path.join('app', 'dist'),
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(APP_FOLDER, 'main', 'index.html'),
      chunks: ['manifest', 'vendors', 'bundle'],
      templateParameters: {
        contentPolicy: mainContentPolicy[process.env.NODE_ENV]
      }
    }),
  ],
}
