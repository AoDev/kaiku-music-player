import _ from 'lodash'
import {ipcpRenderer} from 'electron-ipcp'
import {musicPlayer, mediaLibrary} from 'app-services'
import * as mobx from 'mobx'
import Playlist from './PlaylistModel'
import Player from './PlayerModel'
import Settings from './SettingsModel'
import Library from './LibraryModel'
import Scan from './ScanModel'

const {observable, action} = mobx

export default class AppStore {
  appName = 'Kaiku'

  @observable.ref songPlaying = null
  @observable.ref albumPlaying = null
  @observable.ref artistPlaying = null

  @action.bound assign (props) {
    Object.assign(this, props)
  }

  @action.bound addArtistToPlaylist (artistID) {
    const songs = this.library.getArtistSongs(artistID)
    this.playlist.addSongs(songs)
  }

  @action.bound addAlbumToPlaylist (albumID) {
    const songs = this.library.getAlbumSongs(albumID)
    this.playlist.addSongs(songs)
  }

  @action.bound addSongToPlaylist (songID) {
    const song = _.find(this.library._songs, {_id: songID})
    this.playlist.addSongs([song])
  }

  @action.bound playSongs (songs) {
    this.playlist.setSongs(songs)
    musicPlayer.play()

    const shouldGetDuration = songs.some((song) => song.duration === 0)

    if (shouldGetDuration) {
      ipcpRenderer.sendMain('getSongsDuration', songs)
        .then((songsWithDuration) => {
          this.playlist.set('songs', songsWithDuration)
          mediaLibrary.updateSongs(songsWithDuration) // Save in DB (fire and forget)
        })
    }
  }

  /**
   * Fill the playlist with all the songs of the artist and start playing
   * @param  {Number} artistID
   */
  @action.bound playArtist (artistID) {
    const songs = this.library.getArtistSongs(artistID)
    this.playSongs(songs)
  }

  /**
   * Fill the playlist with all the songs of the album
   * @param  {Number} albumID
   */
  @action.bound playAlbum (albumID) {
    const songs = this.library.getAlbumSongs(albumID)
    this.playSongs(songs)
  }

  /**
   * Fill the playlist with one song and play it
   * @param  {Number} songID
   */
  @action.bound playSong (songID) {
    const songs = [this.library._songs[songID - 1]]
    this.playSongs(songs)
  }

  @action.bound setSongPlaying (songID) {
    this.songPlaying = this.library._songs[songID - 1]
    this.artistPlaying = this.library._artists[this.songPlaying.artistID - 1]
    this.albumPlaying = this.library._albums[this.songPlaying.albumID - 1]
  }

  /**
   * Use the library service to scan songs on the computer
   * @param  {Array of Strings} songsFolders
   */
  @action.bound scanForSongs (songsFolders) {
    const start = Date.now()
    const timer = setInterval(this.scan.updateScanProgress, 150)
    this.scan.inProgress = true

    mediaLibrary.clearLibrary()
      .then(mediaLibrary.init)
      .then(() => {
        mediaLibrary.scan(songsFolders, (err, results) => {
          if (err) {
            console.log(err)
          }
          clearInterval(timer)
          mobx.runInAction(() => {
            this.scan.inProgress = false
            this.scan.timeElapsed = Date.now() - start
            this.library._artists = results._artists
            this.library._albums = results._albums
            this.library._songs = results._songs
          })
        })
      })
  }

  /**
   * Given the index of a song in the current playlist, play this song
   * @param  {Number} playlistSongIndex
   */
  @action.bound playSongFromPlaylist (playlistSongIndex) {
    musicPlayer.play(playlistSongIndex)
  }

  /**
   * Allow the user to view current playing song in the library
   */
  @action.bound focusPlayingSongInLibrary () {
    if (this.songPlaying) {
      this.library.artistSelected = this.artistPlaying
      this.library.albumSelected = this.albumPlaying
      this.library.artistInSight = this.artistPlaying._id
      this.library.albumInSight = this.albumPlaying._id
    }
  }

  /**
   * clear db, stop playing, reset song playlist, reset playlist.
   */
  @action.bound clearLibrary () {
    this.library.clearLibrary()
    this.playlist.emptyPlaylist()
    musicPlayer.stop()
    this.assign({songPlaying: null, albumPlaying: null, artistPlaying: null})
  }

  constructor (options) {
    this.settings = new Settings()
    this.library = new Library()
    this.scan = new Scan()
    this.player = new Player()
    this.playlist = new Playlist()

    /**
     * Setup some actions that should happen based on the player lib events.
     */
    musicPlayer.on('play', this.setSongPlaying)
  }
}
