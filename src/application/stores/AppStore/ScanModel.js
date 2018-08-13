import * as mobx from 'mobx'
import {mediaLibrary} from 'app-services'

const {observable, action} = mobx

export default class Scan {
  @observable timeElapsed = 0
  @observable inProgress = false
  @observable found = 0
  @observable processed = 0

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
