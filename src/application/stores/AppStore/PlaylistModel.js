import _ from 'lodash'
import * as mobx from 'mobx'
import {musicPlayer} from 'app-services'
const {observable, action} = mobx

/**
 * Playlist model
 */
export default class Playlist {
  @observable.ref songs = []
  @observable.ref songsSelected = []

  @action.bound addSongs (songs, atIndex) {
    if (!_.isNumber(atIndex)) {
      this.songs = this.songs.concat(songs)
    }
    musicPlayer.setPlaylist(this.songs)
  }

  @action.bound setSongs (songs) {
    this.songs = songs
    musicPlayer.setPlaylist(songs)
  }

  @action.bound emptyPlaylist () {
    this.songs = []
    musicPlayer.setPlaylist(this.songs)
  }

  @action.bound shufflePlaylist () {
    if (this.songs.length > 0) {
      this.songs = _.shuffle(this.songs)
      musicPlayer.play()
    }
  }

  @action.bound setSongsSelected (songIDs) {
    if (!_.isArray(songIDs)) {
      throw new TypeError('Expected an array of song ID')
    }
    this.songsSelected = songIDs
  }

  /**
   * @param  {Array} songIDs Array of song ids to remove
   */
  @action.bound removeFromPlaylist (songIDs) {
    if (!_.isArray(songIDs)) {
      throw new TypeError('Expected an array of song ID')
    }
    const songsInPlaylist = this.songs.filter((song) => {
      return songIDs.indexOf(song._id) === -1
    })
    this.songs = songsInPlaylist
    musicPlayer.setPlaylist(songsInPlaylist)
  }

  @action.bound set (prop, value) {
    this[prop] = value
  }
}
