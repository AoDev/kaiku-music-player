import {remote} from 'electron'
const path = remote.require('path')
const fs = remote.require('fs')

// @see https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
const configPath = path.join(remote.app.getPath('userData'), 'config.json')

/**
 * Save the user settings as JSON into a file in the app user data folder.
 * Usage: Preserve user preferences on disk.
 */
function save (config) {
  return new Promise((resolve, reject) => {
    fs.writeFile(configPath, config, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

/**
 * Read the config (JSON) from the local config file.
 * Usage: load config at app bootstrapping.
 */
function readLocalConfig () {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, 'utf8', (err, _config) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return resolve({})
        }
        reject(err)
      }
      resolve(JSON.parse(_config))
    })
  })
}

export default {
  save,
  readLocalConfig
}
