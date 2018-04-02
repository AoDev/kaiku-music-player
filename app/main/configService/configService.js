const electron = require('electron')
const path = require('path')
const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// @see https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
const configPath = path.join(electron.app.getPath('userData'), 'config.json')

/**
 * Save the user settings as JSON into a file in the app user data folder.
 * Usage: Preserve user preferences on disk.
 */
function save (config) {
  return writeFile(configPath, config)
}

/**
 * Read the config (JSON) from the local config file.
 * Usage: load config at app bootstrapping.
 */
async function readLocalConfig () {
  try {
    const config = await readFile(configPath, 'utf8')
    return JSON.parse(config)
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return {}
    }
    throw err
  }
}

module.exports = {
  save,
  readLocalConfig
}
