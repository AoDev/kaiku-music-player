const electron = require('electron')
const {app, BrowserWindow, globalShortcut, Menu, ipcMain} = electron
const windowMenu = require('./windowMenu')
const main = require('./main')
const {mediaLibrary} = main

ipcMain.on('getSongsDuration', (event, arg) => {
  mediaLibrary.refreshSongsDuration(arg)
    .then((songs) => {
      event.sender.send('gotSongsDuration', songs)
    })
})

let menu
let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support') // eslint-disable-line
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
  const path = require('path') // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules') // eslint-disable-line
  require('module').globalPaths.push(p) // eslint-disable-line
}

app.on('window-all-closed', () => {
  app.quit()
})

// const installExtensions = async () => {
//   if (process.env.NODE_ENV === 'development') {
//     const installer = require('electron-devtools-installer') // eslint-disable-line global-require

//     const extensions = [
//       'REACT_DEVELOPER_TOOLS',
//       'REDUX_DEVTOOLS'
//     ]
//     const forceDownload = !!process.env.UPGRADE_EXTENSIONS
//     for (const name of extensions) { // eslint-disable-line
//       try {
//         await installer.default(installer[name], forceDownload)
//       } catch (e) {} // eslint-disable-line
//     }
//   }
// }

app.on('ready', async () => {
  // await installExtensions()

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  })

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll()
    mainWindow = null
  })

  if (process.env.NODE_ENV === 'development') {
    // mainWindow.webContents.on('context-menu', (e, props) => {
    //   const { x, y } = props

    //   Menu.buildFromTemplate([{
    //     label: 'Inspect element',
    //     click () {
    //       mainWindow.inspectElement(x, y)
    //     }
    //   }]).popup(mainWindow)
    // })
  }

  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(windowMenu.osx.createTemplate(mainWindow))
    Menu.setApplicationMenu(menu)
  }
  else {
    menu = Menu.buildFromTemplate(windowMenu.default.createTemplate(mainWindow))
    mainWindow.setMenu(menu)
  }

  // Global shortcuts
  globalShortcut.register('MediaPlayPause', function () {
    mainWindow.webContents.send('playPause')
  })

  globalShortcut.register('MediaNextTrack', function () {
    mainWindow.webContents.send('NextInPlaylist')
  })

  globalShortcut.register('MediaPreviousTrack', function () {
    mainWindow.webContents.send('PrevInPlaylist')
  })

  registerLocalEvents(mainWindow)

  mainWindow.on('focus', function () {
    registerLocalEvents(mainWindow)
  })

  mainWindow.on('blur', unregisterLocalEvents)
})

/**
 * Register events listeners that should work only when the app is focused
 * @param  {browser window} win
 */
function registerLocalEvents (win) {
  globalShortcut.register('VolumeUp', function () {
    win.webContents.send('VolumeUp')
  })

  globalShortcut.register('VolumeDown', function () {
    win.webContents.send('VolumeDown')
  })

  globalShortcut.register('VolumeMute', function () {
    win.webContents.send('VolumeMute')
  })

  globalShortcut.register('CommandOrControl+F', function () {
    win.webContents.send('search')
  })
}

/**
 * Unregister events listeners that should work only when app is focused
 */
function unregisterLocalEvents () {
  globalShortcut.unregister('VolumeUp')
  globalShortcut.unregister('VolumeDown')
  globalShortcut.unregister('VolumeMute')
  globalShortcut.unregister('CommandOrControl+F')
}
