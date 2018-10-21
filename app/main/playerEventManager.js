const libraryScanner = require('./libraryScanner')
const mediaLibrary = require('./mediaLibrary')
const {globalShortcut} = require('electron')
const configService = require('./configService')
const {ipcpMain} = require('electron-ipcp')

function registerGlobalEvents (win) {
  // Global shortcuts
  globalShortcut.register('MediaPlayPause', function () {
    win.webContents.send('playPause')
  })

  globalShortcut.register('MediaNextTrack', function () {
    win.webContents.send('NextInPlaylist')
  })

  globalShortcut.register('MediaPreviousTrack', function () {
    win.webContents.send('PrevInPlaylist')
  })
}

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

function register (mainWindow) {
  registerGlobalEvents(mainWindow)
  registerLocalEvents(mainWindow)

  mainWindow.on('focus', function () {
    registerLocalEvents(mainWindow)
  })

  mainWindow.on('blur', unregisterLocalEvents)

  /** ---------------------- IPC messages Handling ----------------------------- **/
  ipcpMain.on('getSongsDuration', async (event, songs) => {
    const songsWithDuration = await mediaLibrary.refreshSongsDuration(songs)
    event.respond(songsWithDuration)
  })

  ipcpMain.on('getSongMetadata', async (event, song, options = {}) => {
    const metadata = await libraryScanner.readMetadata(song.filePath, Object.assign({}, options, {duration: true}))
    event.respond(metadata)
  })

  ipcpMain.on('extractCoverFromSong', async (event, song) => {
    const extractResult = await mediaLibrary.extractCoverFromSong(song)
    event.respond(extractResult)
  })

  ipcpMain.on('getAppSettings', async (event) => {
    const settings = await configService.readLocalConfig()
    event.respond(settings)
  })

  ipcpMain.on('saveAppSettings', async (event, updatedSettings) => {
    try {
      await configService.save(updatedSettings)
      event.respond(true)
    }
    catch (err) {
      event.respond(err.message)
    }
  })
}

module.exports = {
  register
}
