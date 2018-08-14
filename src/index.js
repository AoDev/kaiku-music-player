// https://github.com/electron/electron/blob/master/docs/tutorial/security.md#7-override-and-disable-eval
if (process.env.NODE_ENV === 'production') {
  window.eval = global.eval = function () { // eslint-disable-line
    throw new Error(`Sorry, this app does not support window.eval().`)
  }
}

// Webpack entry point
require('./application')
require('./styles/index.less')
