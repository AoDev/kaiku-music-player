import React, {Component, PropTypes} from 'react'
import {observer, inject} from 'mobx-react'
import _ from 'lodash'
import SongsFolders from './SongsFolders'
import BackgroundImage from './BackgroundImage'

const {dialog} = require('electron').remote

const selectSongFolderDialog = {
  title: 'Select directory to scan',
  properties: ['openDirectory']
}

const selectBgImageDialog = {
  title: 'Select the background image you wish',
  properties: ['openFile'],
  buttonLabel: 'Use this image',
  filters: [
    {name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg']}
  ]
}

const clearLibraryDialog = {
  type: 'question',
  title: 'Clear Library?',
  message: 'Are you sure that you want to clear the music library?',
  detail: 'Your music will not be deleted but you will have to search for songs again.',
  buttons: ['No', 'Yes, clear the library']
}

const cancelScanDialog = {
  type: 'question',
  title: 'Cancel scan?',
  message: 'Are you sure that you want to stop searching for songs?',
  buttons: ['No', 'Yes, stop scan']
}

export class Settings extends Component {
  /**
   * Generate a string for a time in milliseconds. like 6:30
   * @param  {Number} millis
   * @return {String}
   */
  static elapsed (millis) {
    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return `Done in ${minutes} min ${seconds < 10 ? '0' : ''}${seconds} seconds.`
  }

  constructor (props) {
    super(props)
    this.showSelectFolderDialog = this.showSelectFolderDialog.bind(this)
    this.showSelectBackgroundImage = this.showSelectBackgroundImage.bind(this)
    this.showClearLibraryDialog = this.showClearLibraryDialog.bind(this)
    this.onFolderSelected = this.onFolderSelected.bind(this)
    this.onBgImageSelected = this.onBgImageSelected.bind(this)
    this.scanForSongs = this.scanForSongs.bind(this)
    this.removeSongsFolder = this.removeSongsFolder.bind(this)
    this.cancelScan = this.cancelScan.bind(this)
  }

  scanForSongs () {
    const {scanForSongs, settings} = this.props
    scanForSongs(settings.songsFolders)
  }

  onFolderSelected (filenames) {
    if (Array.isArray(filenames) && filenames.length > 0) {
      this.props.settings.addSongsFolder(filenames[0])
    }
    else {
      console.log('Select songs folder was canceled or something went wrong')
    }
  }

  showSelectFolderDialog () {
    const {songsFolders} = this.props.settings
    const dialogSettings = _.clone(selectSongFolderDialog)
    if (songsFolders.length) {
      dialogSettings.defaultPath = songsFolders[songsFolders.length - 1]
    }
    dialog.showOpenDialog(dialogSettings, this.onFolderSelected)
  }

  onBgImageSelected (filenames) {
    if (Array.isArray(filenames) && filenames.length > 0) {
      this.props.settings.setBackgroundImage(encodeURI(filenames[0]))
    }
    else {
      console.log('Select songs folder was canceled or something went wrong')
    }
  }

  showSelectBackgroundImage () {
    const {backgroundImage} = this.props.settings
    const dialogSettings = _.clone(selectBgImageDialog)
    if (backgroundImage) {
      dialogSettings.defaultPath = backgroundImage
    }
    dialog.showOpenDialog(dialogSettings, this.onBgImageSelected)
  }

  removeSongsFolder (event) {
    const folder = event.target.dataset.folder
    this.props.settings.removeSongsFolder(folder)
  }

  cancelScan () {
    const userChoice = dialog.showMessageBox(cancelScanDialog)
    const shouldStop = userChoice === 1
    if (shouldStop) {
      this.props.scan.stopScan()
    }
  }

  showClearLibraryDialog () {
    const userChoice = dialog.showMessageBox(clearLibraryDialog)
    const shouldStop = userChoice === 1
    if (shouldStop) {
      this.props.library.clearLibrary()
    }
  }

  render () {
    const {settings, scan, library} = this.props

    return (
      <div className="modal-overlay">
        <div className="settings">
          <h2>Kaiku settings</h2>
          <button className="close-settings" onClick={settings.hide}>
            Done
          </button>

          <div style={{height: 'calc(100% - 80px)', overflowY: 'auto', overflowX: 'hidden'}}>

            <div className="panel">
              <div className="row space-bottom-1">
                <div className="col-3">
                  <h3>Music Library</h3>
                </div>
                <div className="col-9">
                  <SongsFolders
                    songsFolders={settings.songsFolders}
                    removeSongsFolder={this.removeSongsFolder}
                    showSelectFolderDialog={this.showSelectFolderDialog}/>

                  <hr/>

                  <div className="space-bottom-2 unselectable">
                    <h3>{library.isEmpty ? 'Find songs' : 'Refresh library'}</h3>
                    <p>Search for songs in your computer.</p>
                    {scan.inProgress
                    ? <button className="space-right-1" onClick={this.cancelScan}>
                        Cancel scan
                      </button>
                    : <button className="space-right-1" onClick={this.scanForSongs}>
                        Find songs
                      </button>
                    }

                    {scan.inProgress &&
                      <span>{scan.processed} / {scan.found}</span>
                    }
                    {scan.timeElapsed > 0 && !scan.inProgress &&
                      <em>{Settings.elapsed(scan.timeElapsed)}</em>
                    }
                  </div>

                  <hr/>

                  <h3>Clear library</h3>
                  <p>Remove all the songs from your library.</p>
                  <button onClick={this.showClearLibraryDialog}>Clear Library </button>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="row">
                <div className="col-3">
                  <h3>Appearance</h3>
                </div>
                <div className="col-9">
                  <BackgroundImage
                    backgroundImage={settings.backgroundImage}
                    selectBackgroundImage={this.showSelectBackgroundImage}
                    removeBackgroundImage={settings.removeBackgroundImage}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default inject(({store}) => ({
  scanForSongs: store.scanForSongs,
  settings: store.settings,
  scan: store.scan,
  library: store.library
}))(observer(Settings))

Settings.propTypes = {
  scanForSongs: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    addSongsFolder: PropTypes.func.isRequired,
    backgroundImage: PropTypes.string,
    hide: PropTypes.func.isRequired,
    removeBackgroundImage: PropTypes.func.isRequired,
    removeSongsFolder: PropTypes.func.isRequired,
    setBackgroundImage: PropTypes.func.isRequired,
    songsFolders: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  scan: PropTypes.shape({
    inProgress: PropTypes.bool.isRequired,
    found: PropTypes.number,
    processed: PropTypes.number,
    stopScan: PropTypes.func.isRequired
  }).isRequired,
  library: PropTypes.shape({
    _artists: PropTypes.arrayOf(PropTypes.object).isRequired,
    _albums: PropTypes.arrayOf(PropTypes.object).isRequired,
    _songs: PropTypes.arrayOf(PropTypes.object).isRequired,
    isEmpty: PropTypes.bool.isRequired,
    clearLibrary: PropTypes.func.isRequired
  }).isRequired
}
