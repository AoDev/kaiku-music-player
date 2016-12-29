/**
 * songs = {id: _id, url: http://....}
 */

const validRepeatValues = ['off', 'repeatAll', 'repeatOne']

/**
 * Check that an array contains a value.
 * Utiliy to avoid dependency. eg: lodash.includes
 */
function includes (array, value) {
  return array.indexOf(value) > -1
}

/**
 * @class Playlist
 * Represent a song playlist with various methods to manipulate it.
 */
export default class Playlist {
  constructor (options = {}) {
    this.repeat = options.repeat || 'off'
    this.songs = options.songs || []
    this.currentIndex = 0
  }

  addSongs (songsArr) {
    this.songs = this.songs.concat(songsArr)
  }

  selectSong (index) {
    if (index < 0 || index > this.songs.length - 1) {
      return null
    }
    this.currentIndex = index
    return this.current()
  }

  setPlaylist (songsArr) {
    this.songs = songsArr
    this.currentIndex = 0
  }

  clear () {
    this.songs = []
    this.currentIndex = null
  }

  get isEmpty () {
    return this.songs === null || this.songs.length === 0
  }

  get isFirstSong () {
    return this.currentIndex === 0
  }

  get isLastSong () {
    return this.currentIndex === this.songs.length - 1
  }

  current () {
    if (this.isEmpty) {
      return null
    }
    return {
      song: this.songs[this.currentIndex],
      index: this.currentIndex
    }
  }

  next () {
    if (this.isEmpty) {
      return null
    }

    if (this.repeat === 'repeatOne') {
      return this.songs[this.currentIndex]
    }

    if (this.isLastSong) {
      if (this.repeat === 'repeatAll') {
        this.currentIndex = 0
        return this.songs[0]
      }
      else {
        return null
      }
    }
    this.currentIndex++

    return {
      song: this.songs[this.currentIndex],
      index: this.currentIndex
    }
  }

  prev () {
    if (this.isEmpty) {
      return null
    }

    if (this.repeat === 'repeatOne') {
      return this.songs[this.currentIndex]
    }

    if (this.isFirstSong) {
      if (this.repeat === 'repeatAll') {
        this.currentIndex = this.songs.length - 1
        return this.songs[this.currentIndex]
      }
      else {
        return null
      }
    }
    this.currentIndex--

    return {
      song: this.songs[this.currentIndex],
      index: this.currentIndex
    }
  }

  /**
   * Change what song will be returned by the playlist
   * depending on the repeat behaviour.
   *
   * @param {String} repeatValue 'off', 'repeatAll', 'repeatOne'
   */
  setRepeat (repeatValue) {
    if (includes(validRepeatValues, repeatValue)) {
      this.repeat = repeatValue
    }
    else {
      throw new TypeError('Expected valid repeat value but got: ' + repeatValue)
    }
  }
}
