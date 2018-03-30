import React from 'react'
import reactDom from 'react-dom'
import * as mobx from 'mobx'
import utils from './utils'
import App from './App'
import KaikuStore from './App/KaikuStore'
import {Provider} from 'mobx-react'
import mediaLibrary from './lib/mediaLibrary'
import configService from './lib/configService'
import {ipcRenderer} from 'electron'
import {AppContainer} from 'react-hot-loader'

import styles from './styles/index.less' // eslint-disable-line no-unused-vars

mobx.configure({enforceActions: true})

const store = new KaikuStore({
  configService
})

// @see https://github.com/gaearon/react-hot-loader/issues/462#issuecomment-273666754
delete AppContainer.prototype.unstable_handleError

// AppContainer is a necessary wrapper component for HMR
const render = (Component) => {
  reactDom.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

mediaLibrary.init()
  .then(() => {
    console.log('Kaiku db init.')
    render(App)
  })

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    render(App)
  })
}

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
