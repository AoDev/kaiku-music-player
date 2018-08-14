import {AppContainer} from 'react-hot-loader'
import {ipcRenderer} from 'electron'
import {Provider} from 'mobx-react'
import * as mobx from 'mobx'
import React from 'react'
import reactDom from 'react-dom'
import utils from 'app-utils'
import App from './App'
import {mediaLibrary} from 'app-services'
import RootStore from './stores/RootStore'
// import mobxSpyLogger from 'mobx-spy-logger'
// mobxSpyLogger.start()

mobx.configure({enforceActions: true})

const rootStore = new RootStore()
const {appStore, uiStore} = rootStore

// @see https://github.com/gaearon/react-hot-loader/issues/462#issuecomment-273666754
delete AppContainer.prototype.unstable_handleError

// AppContainer is a necessary wrapper component for HMR
const render = (Component) => {
  reactDom.render(
    <AppContainer>
      <Provider appStore={appStore} rootStore={rootStore} uiStore={uiStore}>
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
ipcRenderer.on('toggleSettings', appStore.settings.toggle)
ipcRenderer.on('playPause', appStore.player.playPause)
ipcRenderer.on('NextInPlaylist', appStore.player.playNext)
ipcRenderer.on('PrevInPlaylist', appStore.player.playPrevious)

ipcRenderer.on('VolumeUp', function () {
  const {player} = appStore
  const newVolume = player.volume + 0.02
  player.setVolume(newVolume > 1 ? 1 : newVolume)
})

ipcRenderer.on('VolumeDown', function () {
  const {player} = appStore
  const newVolume = player.volume - 0.02
  player.setVolume(newVolume < 0 ? 0 : newVolume)
})

ipcRenderer.on('VolumeMute', function () {
  appStore.player.toggleMute()
})

ipcRenderer.on('search', function () {
  document.querySelector('#search').focus()
})

// Listen for messages
ipcRenderer.on('message', function (event, text) {
  console.log(text)
})

/**
 * Automatically apply new background image when its path is changed
 */
mobx.reaction(() => {
  return appStore.settings.backgroundImage === ''
    ? ''
    : `
    body {
      background-image: url(file://${appStore.settings.backgroundImage});
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

export default {
  appStore
}
