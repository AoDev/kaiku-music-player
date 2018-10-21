import _ from 'lodash'
import * as mobx from 'mobx'

const {observable, computed, action} = mobx

const validRepeatValues = ['off', 'repeatAll', 'repeatOne']

export default class Playlist {
  @observable currentIndex = -1
  @observable.ref songs = []
  @observable repeatMode = 'off'

  @computed get isEmpty () {
    return this.songs.length === 0
  }

  @computed get isFirstSong () {
    return this.currentIndex === 0
  }

  @computed get isLastSong () {
    return this.currentIndex === this.songs.length - 1
  }

  @computed get currentSong () {
    if (this.isEmpty || this.currentIndex === -1) {
      return null
    }

    return this.songs[this.currentIndex]
  }

  @action.bound addSongs (songsArr) {
    this.songs = this.songs.concat(songsArr)
  }

  /**
   * @param {Number} index - index of the song to set as current
   */
  @action.bound selectSong (index) {
    if (index < 0 || index > this.songs.length - 1) {
      return null
    }
    this.currentIndex = index
    return this.currentSong
  }

  @action.bound setSongs (songsArr) {
    this.songs = songsArr
    this.currentIndex = 0
  }

  @action.bound clear () {
    this.songs = []
    this.currentIndex = -1
  }

  /**
   * @returns {Number} index of the next song. -1 if can't go next.
   */
  @action.bound goToNext () {
    let newIndex = -1
    if (this.isEmpty || (this.isLastSong && this.repeatMode === 'off')) {
      return -1
    }
    if (this.repeatMode === 'repeatOne') {
      newIndex = this.currentIndex
    }
    else if (this.repeatMode === 'repeatAll' && this.isLastSong) {
      newIndex = 0
    }
    else if (!this.isLastSong) {
      newIndex = this.currentIndex + 1
    }
    this.currentIndex = newIndex
    return newIndex
  }

  /**
   * @returns {Number} index of the previous song. -1 if can't go previous.
   */
  @action.bound goToPrev () {
    let newIndex = -1
    if (this.isEmpty || (this.isFirstSong && this.repeatMode === 'off')) {
      return -1
    }
    if (this.repeatMode === 'repeatOne') {
      newIndex = this.currentIndex
    }
    else if (this.repeatMode === 'repeatAll' && this.isFirstSong) {
      newIndex = this.songs.length - 1
    }
    else if (!this.isFirstSong) {
      newIndex = this.currentIndex - 1
    }
    this.currentIndex = newIndex
    return newIndex
  }

  /**
   * Change what song will be returned by the playlist
   * depending on the repeat behaviour.
   *
   * @param {String} repeatValue 'off', 'repeatAll', 'repeatOne'
   */
  @action.bound setRepeat (repeatValue) {
    if (_.includes(validRepeatValues, repeatValue)) {
      this.repeatMode = repeatValue
    }
    else {
      throw new TypeError('Expected valid repeat value but got: ' + repeatValue)
    }
  }

  @action.bound toggleRepeat () {
    switch (this.repeatMode) {
      case 'off': this.setRepeat('repeatAll'); break
      case 'repeatAll': this.setRepeat('repeatOne'); break
      case 'repeatOne': this.setRepeat('off'); break
    }
  }

  @action.bound shuffle () {
    if (this.songs.length > 0) {
      this.songs = _.shuffle(this.songs)
      this.currentIndex = 0
    }
  }

  /**
   * @param {Array} songIndexes - array/list of song indexes to remove
   */
  @action.bound removeSongsAt (songIndexes) {
    const isCurrentInIndexes = songIndexes.indexOf(this.currentIndex) > -1

    if (isCurrentInIndexes) {
      this.currentIndex = -1
    }
    else {
      const indexShift = songIndexes.reduce((indexShift, songIndex) => {
        if (songIndex < this.currentIndex) {
          indexShift++
        }
        return indexShift
      }, 0)
      this.selectSong(this.currentIndex - indexShift)
    }

    this.songs = this.songs.filter((song, index) => {
      return songIndexes.indexOf(index) === -1
    })
  }

  init () {

  }

  constructor (musicPlayer) {
    this.musicPlayer = musicPlayer
    this.init()
  }
}
