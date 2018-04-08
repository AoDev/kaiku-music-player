const path = require('path')

module.exports = {
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  setupTestFrameworkScriptFile: path.join('<rootDir>', 'test-setup.js')
}
