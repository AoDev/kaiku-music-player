import * as mobx from 'mobx'
import {mediaLibrary} from 'app-services'

const {observable, action} = mobx

export default class Scan {
  @observable timeElapsed = 0
  @observable inProgress = false
  @observable found = 0
  @observable processed = 0

  @action.bound set (prop, value) {
    this[prop] = value
  }

  @action.bound assign (props) {
    Object.assign(this, props)
  }

  /**
   * Set the progress state from the media library scanner
   */
  @action.bound updateScanProgress () {
    const progress = mediaLibrary.libraryScanner.getProgress()
    this.found = progress.found
    this.processed = progress.processed
  }

  @action.bound stopScan () {
    mediaLibrary.stopScan()
  }
}
