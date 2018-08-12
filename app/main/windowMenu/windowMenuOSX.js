const _ = require('lodash')
const {baseTemplate} = require('./windowMenuBase')

function createTemplate (mainWindow) {
  if (!_.isObject(mainWindow)) {
    throw new TypeError('Missing mainWindow')
  }

  const mainMenu = {
    label: 'Cryptovista',
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {
        label: 'Preferences',
        accelerator: 'Command+,',
        click () {
          mainWindow.webContents.send('toggleSettings')
        }
      },
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  }

  // Override Base Window menu
  baseTemplate[2].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]

  const template = [
    mainMenu
  ].concat(baseTemplate)

  return template
}

module.exports = {
  createTemplate
}
