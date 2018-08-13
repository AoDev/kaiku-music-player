import MusicPlayer from './MusicPlayer'
import Playlist from './Playlist'
import * as mobx from 'mobx'

const {observable} = mobx

export default class MusicPlayerExtended extends MusicPlayer {
  @observable nextSongIndex = -1 // override next song from playlist

  playSongs (songs) {
    this.playlist.setSongs(songs)
    this.play(songs[0])
  }

  playFromPlaylistAt (songIndex) {
    const song = this.playlist.selectSong(songIndex)
    this.play(song)
  }

  playNext () {
    const index = this.playlist.goToNext()
    if (index > -1) {
      this.play(this.playlist.currentSong)
    }
  }

  playPrevious () {
    const index = this.playlist.goToPrev()
    if (index > -1) {
      this.play(this.playlist.currentSong)
    }
  }

  /**
   * @param {Array} songIndexes - list of songs indexes
   */
  removeSongsFromPlaylist (songIndexes) {
    const currentIndex = this.playlist.currentIndex
    const currentIsInIndexes = songIndexes.indexOf(currentIndex) > -1
    this.playlist.removeSongsAt(songIndexes)
    if (currentIsInIndexes && this.playlist.songs.length > currentIndex) {
      this.nextSongIndex = currentIndex
    }
  }

  shuffle () {
    this.playlist.shuffle()
    this.play(this.playlist.currentSong)
  }

  init () {
    this.stopAutoPlayNext = mobx.autorun(() => {
      if (this.sound && this.sound.ended) {
        if (this.nextSongIndex === -1) {
          this.playNext()
        }
        else {
          this.playlist.selectSong(this.nextSongIndex)
          this.play(this.playlist.currentSong)
          this.nextSongIndex = -1
        }
      }
    }, {name: 'autoPlayNext'})
  }

  constructor () {
    super()
    this.playlist = new Playlist()
    this.playSongs = this.playSongs.bind(this)
    this.playNext = this.playNext.bind(this)
    this.playPrevious = this.playPrevious.bind(this)
    this.shuffle = this.shuffle.bind(this)
    this.removeSongsFromPlaylist = this.removeSongsFromPlaylist.bind(this)
    this.init()
  }
}
