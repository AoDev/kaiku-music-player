/**
 * @module musicPlayer
 *
 * A Music Player working with Howler behind the hoods.
 * @see  https://howlerjs.com/
 */

import _ from 'lodash'
import Playlist from './Playlist'
import events from 'events'
import howler from 'howler'

const Howl = howler.Howl
var playlist

/**
 *
 * @param {Object} options
 * {
 *   repeat: 'off' | 'repeatAll' | 'repeatOne'
 * }
 */
function MusicPlayer (options = {}) {
  this.sound = null
  this.updatePosition = this.updatePosition.bind(this)
  this.playNext = this.playNext.bind(this)
  this.getVolume = this.getVolume.bind(this)
  this.setVolume = this.setVolume.bind(this)
  playlist = new Playlist()
  playlist.setRepeat(options.repeat || 'off')
  this.volume = options.volume || 0.3
}

_.merge(MusicPlayer.prototype, events.EventEmitter.prototype)

_.merge(MusicPlayer.prototype, {

  play (indexInPlaylist) {
    const that = this

    const song = _.isNumber(indexInPlaylist)
      ? playlist.selectSong(indexInPlaylist).song
      : playlist.current().song

    if (this.sound) {
      this.sound.stop()
      clearInterval(that.updateTimer)
    }

    this.sound = new Howl({
      src: ['file://' + song.filePath],
      html5: true,
      volume: this.volume,
      onplay () {
        that.updateTimer = setInterval(that.updatePosition, 100)
      },
      onpause () {
        if (that.updateTimer) {
          clearInterval(that.updateTimer)
        }
      },
      onend: that.playNext
    })

    this.sound.play()
    this.emit('play', song._id)
  },

  updatePosition () {
    const sound = this.sound
    this.emit('playing', {
      position: sound.seek(),
      duration: sound.duration()
    })
  },

  playNext () {
    var next = playlist.next()
    if (next) {
      this.play(next.index)
    }
  },

  playPrev () {
    var prev = playlist.prev()
    if (prev) {
      this.play(prev.index)
    }
  },

  pause () {
    this.sound && this.sound.pause()
    this.emit('pause')
  },

  toggle () {
    this.sound && this.sound.togglePause()
  },

  resume () {
    this.sound && this.sound.play()
    this.emit('play', playlist.current().song._id)
  },

  setPlaylist (songs) {
    playlist.setPlaylist(songs)
  },

  setVolume (newIntensity, direction) {
    var intensity

    if (typeof newIntensity === 'number') {
      intensity = newIntensity
    }
    else if (direction) {
      if (direction === 'up') {
        intensity = this.volume + 0.03
        if (intensity > 1) {
          intensity = 1
        }
      }
      if (direction === 'down') {
        intensity = this.volume - 0.03
        if (intensity < 0) {
          intensity = 0
        }
      }
    }

    if (this.sound) {
      this.sound.volume(_.floor(intensity, 2))
    }
    this.volume = intensity
  },

  currentSong () {
    return playlist.current()
  },

  getVolume () {
    return this.volume
  },

  /**
   * When there is a seek action, updatePosition is called
   * to emit the new position.
   * @param  {Number} relativePosition
   */
  goToSongPosition (relativePosition) {
    this.sound.seek(this.sound.duration() * relativePosition)
    this.updatePosition()
  },

  setRepeat (repeatValue) {
    playlist.setRepeat(repeatValue)
  }
})

const musicPlayerInstance = new MusicPlayer()

export default musicPlayerInstance
