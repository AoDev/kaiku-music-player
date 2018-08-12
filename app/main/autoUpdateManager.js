const {autoUpdater} = require('electron-updater')
const {ipcpMain} = require('electron-ipcp')

autoUpdater.autoDownload = false

const platform = process.platform

/**
 * @param {Object} win - window created in main process
 */
function register (win) {
  function sendStatusToWindow (status, data) {
    win.webContents.send('auto-update', status, data)
  }

  autoUpdater.on('update-available', () => {
    sendStatusToWindow('update-available', {platform})
  })

  autoUpdater.on('download-progress', (progressObj) => {
    sendStatusToWindow('downloading', {percent: progressObj.percent})
  })

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
  })

  ipcpMain.on('fetch-app-update', () => {
    autoUpdater.downloadUpdate()
  })

  return autoUpdater
}

module.exports = {
  register
}
