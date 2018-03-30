const _ = require('lodash')

function createTemplate (mainWindow) {
  if (!_.isObject(mainWindow)) {
    throw new TypeError('Missing mainWindow')
  }

  var template = [
    {
      label: '&File',
      submenu: [
        {
          label: '&Open',
          accelerator: 'Ctrl+O'
        },
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click () {
            mainWindow.close()
          }
        }
      ]
    },
    {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development')
        ? [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click () {
              mainWindow.webContents.reload()
            }
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click () {
              mainWindow.setFullScreen(!mainWindow.isFullScreen())
            }
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click () {
              mainWindow.toggleDevTools()
            }
          }
        ]
        : [
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click () {
              mainWindow.setFullScreen(!mainWindow.isFullScreen())
            }
          }
        ]
    },
    {
      label: 'Help',
      submenu: []
    }
  ]

  return template
}

module.exports = {
  createTemplate
}
