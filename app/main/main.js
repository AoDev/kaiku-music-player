const electron = require('electron')
const {app, BrowserWindow, globalShortcut, Menu} = electron
const windowMenu = require('./windowMenu')
const playerEventManager = require('./playerEventManager')

const logger = console

let menu
let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support') // eslint-disable-line
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({
    showDevTools: false,
    devToolsMode: 'right'
  })
  const path = require('path') // eslint-disable-line
  const p = path.resolve(__dirname, '..', 'app', 'node_modules') // eslint-disable-line
  require('module').globalPaths.push(p) // eslint-disable-line
}

app.on('window-all-closed', () => {
  app.quit()
})

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  })

  // launch DevTools at startup. Useful to debug packaged apps
  // mainWindow.webContents.openDevTools()

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  playerEventManager.register(mainWindow)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll()
    mainWindow = null
  })

  // Register window native menus
  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(windowMenu.osx.createTemplate(mainWindow))
    Menu.setApplicationMenu(menu)
  }
  else {
    menu = Menu.buildFromTemplate(windowMenu.default.createTemplate(mainWindow))
    mainWindow.setMenu(menu)
  }

  if (process.env.NODE_ENV === 'development') {
    const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
    installExtension(REACT_DEVELOPER_TOOLS, !!'forceDownload')
      .then((name) => logger.log(`Added Extension:  ${name}`))
      .catch((err) => logger.log('An error occurred: ', err))
  }

  // TODO: enable when we releases are created
  // if (process.env.NODE_ENV === 'production') {
  //   const autoUpdateManager = require('./autoUpdateManager')
  //   const autoUpdater = autoUpdateManager.register(mainWindow)
  //   setTimeout(() => {
  //     autoUpdater.checkForUpdates()
  //   }, 3000)
  // }
})
