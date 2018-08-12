const _ = require('lodash')
const {app} = require('electron')
const {baseTemplate} = require('./windowMenuBase')

function createTemplate (mainWindow) {
  if (!_.isObject(mainWindow)) {
    throw new TypeError('Missing mainWindow')
  }

  const file = {
    label: 'File',
    submenu: [
      {
        label: 'Settings',
        click () {
          mainWindow.webContents.send('toggleSettings')
        }
      },
      {type: 'separator'},
      {
        label: 'Version ' + app.getVersion(),
      }
    ]
  }

  var defaultMenuTemplate = [
    file,
  ].concat(baseTemplate)

  return defaultMenuTemplate
}

module.exports = {
  createTemplate
}
