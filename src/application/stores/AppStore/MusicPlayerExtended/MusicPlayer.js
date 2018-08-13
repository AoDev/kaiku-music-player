/**
 *
 * A Music Player working with Howler behind the hoods.
 * @see  https://howlerjs.com/
 */

import * as mobx from 'mobx'
import howler from 'howler'
import utils from 'app-utils'
import _ from 'lodash'

const {observable, action, computed} = mobx

const Howl = howler.Howl

class OHowl {
  @observable isPlaying = false
  @observable position = 0
  @observable duration = 0.01
  @observable ended = false
  @observable.ref song = null
  /** @type {Howl} */
  @observable.ref sound = null

  @computed get positionInPercent () {
    return utils.percentage(this.position, this.duration)
  }

  @computed get positionInMinSec () {
    var minutes = Math.floor(this.position / 60)
    var seconds = Math.floor(this.position % 60)
    return {
      minutes,
      seconds,
    }
  }

  @computed get durationInMinSec () {
    var minutes = Math.floor(this.duration / 60)
    var seconds = Math.floor(this.duration % 60)
    return {
      minutes,
      seconds,
    }
  }

  @action.bound play () {
    this.sound.play()
    this.isPlaying = true
  }

  @action.bound pause () {
    this.sound.pause()
    this.isPlaying = false
  }

  @action.bound stop () {
    this.sound.stop()
    this.isPlaying = false
  }

  @action.bound togglePause () {
    this.isPlaying ? this.pause() : this.play()
    return this.isPlaying
  }

  @action.bound setEnded () {
    this.ended = true
  }

  @action.bound updatePosition () {
    this.position = this.sound.seek()
    this.duration = this.sound.duration()
  }

  @action.bound setVolume (intensity) {
    this.sound.volume(intensity)
  }

  /**
   * When there is a seek action, updatePosition is called
   * to emit the new position.
   * @param  {Number} position
   */
  @action.bound goToPosition (position) {
    this.sound.seek(position)
    this.position = position
  }

  destroy () {
    this.stopPositionUpdater()
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  }

  constructor (song, {volume}) {
    this.song = song

    this.sound = new Howl({
      src: ['file://' + song.filePath],
      html5: true,
      volume: volume,
      onend: this.setEnded
    })

    this.stopPositionUpdater = mobx.autorun(() => {
      if (this.isPlaying && !this.updateTimer) {
        this.updateTimer = setInterval(this.updatePosition, 100)
      }
      else {
        window.clearInterval(this.updateTimer)
      }
    })
  }
}

export default class MusicPlayer {
  /** @type {Howl} */
  @observable.ref sound = null
  @observable.ref song = null
  @observable volume = 0.3
  previousVolume = 0

  @computed get isPlaying () {
    return !!this.sound && this.sound.isPlaying
  }

  @action.bound play (song) {
    this.song = song

    if (this.sound) {
      this.sound.stop()
      this.sound.destroy()
    }

    this.sound = new OHowl(song, {volume: this.volume})
    this.sound.play()
  }

  @action.bound pause () {
    this.sound && this.sound.pause()
  }

  @action.bound stop () {
    this.sound && this.sound.stop()
  }

  @action.bound playPause () {
    this.sound && this.sound.togglePause()
  }

  @action.bound setVolume (volume) {
    this.volume = _.floor(volume, 2)
  }

  @action.bound toggleMute () {
    if (this.volume > 0) {
      this.previousVolume = this.volume
      this.setVolume(0)
    }
    else {
      this.setVolume(this.previousVolume)
    }
  }

  setupReactions () {
    this.stopAdjustVolume = mobx.autorun(() => {
      if (this.sound) {
        this.sound.setVolume(this.volume)
      }
    }, {name: 'autoAdjustVolume'})
  }

  constructor () {
    this.setupReactions()
  }
}
