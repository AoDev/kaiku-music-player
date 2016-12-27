import React from 'react'
import reactDom from 'react-dom'
import mobx from 'mobx'
import utils from './utils'
import App from './App'
import KaikuStore from './App/KaikuStore'
import {Provider} from 'mobx-react'
import mediaLibrary from './lib/mediaLibrary'
import configService from './lib/configService'
import {ipcRenderer} from 'electron'

import styles from './styles/index.less' // eslint-disable-line no-unused-vars

mobx.useStrict(true)

const store = new KaikuStore({
  configService
})

mediaLibrary.init()
  .then(() => {
    console.log('Kaiku db init.')
    reactDom.render(
      <Provider store={store}>
        <App/>
      </Provider>,
      document.getElementById('root')
    )
  })

// Listen for events from main process through IPC
ipcRenderer.on('toggleSettings', store.settings.toggle)
ipcRenderer.on('playPause', store.player.playPause)
ipcRenderer.on('NextInPlaylist', store.player.nextInPlaylist)
ipcRenderer.on('PrevInPlaylist', store.player.prevInPlaylist)

ipcRenderer.on('VolumeUp', function () {
  store.player.setVolume(null, 'up')
})

ipcRenderer.on('VolumeDown', function () {
  store.player.setVolume(null, 'down')
})

ipcRenderer.on('VolumeMute', function () {
  store.player.setVolume(0)
})

ipcRenderer.on('search', function () {
  document.querySelector('#search').focus()
})

/**
 * Automatically apply new background image when its path is changed
 */
mobx.reaction(() => {
  return store.settings.backgroundImage === ''
    ? ''
    : `
    body {
      background-image: url(${store.settings.backgroundImage});
      background-size: cover;
    }
  `
}, (backgroundCSS) => {
  backgroundCSS !== ''
    ? utils.injectCSS('bg-image', backgroundCSS)
    : utils.removeCSS('bg-image')
}, {
  name: 'updateBackground'
})
