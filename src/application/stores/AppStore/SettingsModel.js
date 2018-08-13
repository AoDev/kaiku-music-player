import _ from 'lodash'
import {ipcpRenderer} from 'electron-ipcp'
import * as mobx from 'mobx'
const {observable, action} = mobx

/**
 * Settings model
 */
export default class Settings {
  @observable.ref songsFolders = []
  @observable visible = false
  @observable backgroundImage = '' // Image in the player background, must be formatted through encodeURI

  /**
   * Control settings panel visibility
   */
  @action.bound show () {
    this.visible = true
  }

  @action.bound hide () {
    this.visible = false
  }

  @action.bound toggle () {
    this.visible = !this.visible
  }

  @action.bound addSongsFolder (folderPath) {
    this.songsFolders = this.songsFolders.concat([folderPath])
  }

  @action.bound removeSongsFolder (folderPath) {
    this.songsFolders = _.without(this.songsFolders, folderPath)
  }

  @action.bound setBackgroundImage (filePath) {
    this.backgroundImage = filePath
  }

  @action.bound removeBackgroundImage () {
    this.backgroundImage = ''
  }

  @action.bound async restoreSettings () {
    try {
      const settings = await ipcpRenderer.sendMain('getAppSettings')
      mobx.runInAction(() => {
        this.songsFolders = settings.songsFolders || []
        this.backgroundImage = settings.backgroundImage || ''
      })
    }
    catch (err) {
      console.error(err)
      alert('Could not load local config.')
    }
  }

  constructor () {
    this.restoreSettings()

    /**
     * Automatically save the app config to config.json
     * when some settings change.
     */
    mobx.reaction(() => {
      return JSON.stringify({
        songsFolders: this.songsFolders,
        backgroundImage: this.backgroundImage
      }, null, 2)
    }, (config) => {
      ipcpRenderer.sendMain('saveAppSettings', config)
        .catch((err) => {
          console.error(err)
          alert('Issue while saving settings.')
        })
    }, {
      name: 'saveSettings'
    })
  }
}
