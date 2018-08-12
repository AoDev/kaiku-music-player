import * as mobx from 'mobx'
import {musicPlayer} from 'app-services'
const {observable, action} = mobx

/**
 * Player model
 * Its goal is mainly to proxy the html5 audio player
 * state and methods to the UI.
 */
export default class Player {
  @observable repeat = 'off'
  @observable isPlaying = false
  @observable duration = 0
  @observable position = 0
  @observable volume = 0.3

  @action.bound updateTime (time) {
    this.duration = time.duration
    this.position = time.position
  }

  @action.bound playPause () {
    const method = this.isPlaying ? 'pause' : 'resume'
    musicPlayer[method]()
  }

  @action.bound nextInPlaylist () {
    musicPlayer.playNext()
  }

  @action.bound prevInPlaylist () {
    musicPlayer.playPrev()
  }

  @action.bound toggleRepeat () {
    switch (this.repeat) {
      case 'off': this.repeat = 'repeatAll'; break
      case 'repeatAll': this.repeat = 'repeatOne'; break
      case 'repeatOne': this.repeat = 'off'; break
    }

    musicPlayer.setRepeat(this.repeat)
  }

  @action.bound setVolume (intensity, direction) {
    musicPlayer.setVolume(intensity, direction)
    this.volume = musicPlayer.getVolume()
  }

  @action.bound goToSongPosition (relativePosition) {
    // FIXME: currentSong() comes from playlist.
    // If the user empties the playlist, this fails.
    // Instead of currentSong() it should be songPlaying
    if (musicPlayer.currentSong()) {
      musicPlayer.goToSongPosition(relativePosition)
    }
  }

  // Generic setter wrapped in an action
  @action.bound set (property, value) {
    this[property] = value
  }

  constructor () {
    musicPlayer.on('playing', this.updateTime)
    musicPlayer.on('seek', this.updateTime)
    /**
     * Only toggle isPlaying through the player events.
     * The player can be controlled in multiple ways in the UI or via keystrokes.
     * Better use is as single source of truth.
     */
    musicPlayer.on('play', () => {
      this.set('isPlaying', true)
    })
    musicPlayer.on('pause', () => {
      this.set('isPlaying', false)
    })
    musicPlayer.on('stop', () => {
      this.set('isPlaying', false)
    })
  }
}
