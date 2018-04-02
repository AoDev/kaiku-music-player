import * as mobx from 'mobx'
import mediaLibrary from '../lib/mediaLibrary'
import musicPlayer from '../lib/musicPlayer'
import _ from 'lodash'
import ipcpRenderer from '../utils/ipcpRenderer'

const {observable, computed, action} = mobx

/**
 * Dummy error handler until something more useful is done
 */
function errorHandler (err) {
  console.log(err)
}

/**
 * Playlist model
 */
class Playlist {
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

/**
 * Player model
 * Its goal is mainly to proxy the html5 audio player
 * state and methods to the UI.
 */
class Player {
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

/**
 * Settings model
 */
class Settings {
  @observable.ref songsFolders = []
  @observable visible = false
  @observable backgroundImage = '' // Image in the player background, must be formatted through encodeURI

  /**
   * Control settings panel visibility
   */
  @action.bound show () {
    this.visible = true
  }

  @action.bound hide () {
    this.visible = false
  }

  @action.bound toggle () {
    this.visible = !this.visible
  }

  @action.bound addSongsFolder (folderPath) {
    this.songsFolders = this.songsFolders.concat([folderPath])
  }

  @action.bound removeSongsFolder (folderPath) {
    this.songsFolders = _.without(this.songsFolders, folderPath)
  }

  @action.bound setBackgroundImage (filePath) {
    this.backgroundImage = filePath
  }

  @action.bound removeBackgroundImage () {
    this.backgroundImage = ''
  }

  @action.bound setConfig (config) {
    this.songsFolders = config.songsFolders || []
    this.backgroundImage = config.backgroundImage || ''
  }

  @action.bound restoreSettings (configPath) {
    this.configService
      .readLocalConfig()
      .then(this.setConfig)
      .catch((err) => {
        errorHandler(err)
        alert('Could not load local config.')
      })
  }

  constructor ({configService}) {
    this.configService = configService
    this.restoreSettings()

    /**
     * Automatically save the app config to config.json
     * when some settings change.
     */
    mobx.reaction(() => {
      return JSON.stringify({
        songsFolders: this.songsFolders,
        backgroundImage: this.backgroundImage
      }, null, 2)
    }, (config) => {
      this.configService
        .save(config)
        .catch((err) => {
          errorHandler(err)
          alert('Issue while saving settings.')
        })
    }, {
      name: 'saveSettings'
    })
  }
}

class Library {
  @observable isLoaded = false
  /**
   * A regular expression that is used to filter the lists.
   * @type {RegExp}
   */
  @observable.ref filter = null
  @observable.ref artistInSight = null
  @observable.ref albumInSight = null
  /**
   * There should always be an artist selected unless there is a filter.
   * Main reason is for performance: avoid loading all songs until we have
   * some lazy loading.
   */
  @observable.ref artistSelected = null
  @observable.ref albumSelected = null
  @observable.ref songSelected = null
  /**
   * These arrays hold the full library data, loaded from DB.
   * They should not be mutated. @see the next derived properties.
   */
  @observable.ref _artists = []
  @observable.ref _albums = []
  @observable.ref _songs = []
  /**
   * Actual list of artists to be displayed via the Library component
   */
  @computed get artists () {
    if (this.filter) {
      let filter = this.filter
      return this._artists.filter(function (artist) {
        return filter.test(artist.name)
      })
    }
    else {
      return this._artists
    }
  }
  /**
   * Actual list of albums to be displayed via the Library component
   */
  @computed get albums () {
    const artistSelectedId = this.artistSelected ? this.artistSelected._id : null

    if (artistSelectedId) {
      return this._albums.filter(function (album) {
        return album.artistID === artistSelectedId
      })
    }
    else if (this.filter) {
      let filter = this.filter
      return this._albums.filter(function (album) {
        return filter.test(album.title)
      })
    }
    else {
      // Avoid displaying all albums if, for some mistake, there is no
      // filtering criteria. This can be changed later if lazy loading is
      // implemented.
      return []
    }
  }
  /**
   * Actual list of songs to be displayed via the Library component
   */
  @computed get songs () {
    const artistSelectedId = this.artistSelected ? this.artistSelected._id : null
    const albumSelectedId = this.albumSelected ? this.albumSelected._id : null

    if (albumSelectedId) {
      return this.getAlbumSongs(albumSelectedId)
    }
    else if (artistSelectedId) {
      return this.getArtistSongs(artistSelectedId)
    }
    else if (this.filter) {
      let filter = this.filter
      return this._songs.filter(function (song) {
        return filter.test(song.title)
      })
    }
    else {
      // Avoid displaying all songs if, for some mistake, there is no
      // filtering criteria. This can be changed later if lazy loading is
      // implemented.
      return []
    }
  }

  @computed get isEmpty () {
    return this.isLoaded && this._songs.length === 0
  }

  getArtistSongs (artistID, {ordered = true} = {}) {
    const songs = this._songs.filter((song) => {
      return song.artistID === artistID
    })

    if (ordered) {
      let albums = songs.reduce((albums, song) => {
        if (!albums[song.albumID]) {
          albums[song.albumID] = this._albums[song.albumID - 1]
        }
        return albums
      }, {})

      const songsByAlbum = _.groupBy(songs, 'albumID')

      return (
        _.orderBy(albums, ['year'], 'ASC')
          .map((album) => album._id)
          .reduce((artistSongs, albumID) => {
            return artistSongs.concat(_.sortBy(songsByAlbum[albumID], 'trackNr'))
          }, [])
      )
    }
    return songs
  }

  getAlbumSongs (albumID, {ordered = true} = {}) {
    const songs = this._songs.filter((song) => {
      return song.albumID === albumID
    })

    if (ordered) {
      return _.sortBy(songs, ['trackNr'])
    }

    return songs
  }

  @action.bound setArtists (artists) {
    this._artists = artists
  }

  @action.bound setAlbums (albums) {
    this._albums = albums
  }

  @action.bound setSongs (songs) {
    this._songs = songs
  }

  /**
   * Fetch the library artists, albums, songs from the webSQL db
   * Set these to the store library.
   */
  @action.bound loadLibraryFromDb () {
    mediaLibrary.findArtists()
      .then(this.setArtists)
      .catch(errorHandler)

    mediaLibrary.findAlbums()
      .then(this.setAlbums)
      .catch(errorHandler)

    mediaLibrary.findSongs()
      .then(this.setSongs)
      .then(mobx.action(() => {
        this.isLoaded = true
      }))
      .catch(errorHandler)
  }

  /**
   * Update the artist data.
   * Will refresh its album and update the lastUpdated data.
   * Then it will reload the library.
   *
   * @param  {Object} artist
   * @return {Promise}
   */
  @action.bound refreshArtist (artist) {
    return mediaLibrary
      .refreshArtistData(artist._id)
      .then(mobx.action('artist.lastUpdated', (_artist) => {
        artist.lastUpdated = _artist.lastUpdated
        return artist
      }))
      .then(mediaLibrary.findAlbums)
      .then(this.setAlbums)
      .catch(errorHandler)
  }

  @action.bound refreshSongData (songID) {
    return mediaLibrary
      .refreshSongData(songID)
      .then(mediaLibrary.findSongs)
      .then(this.setSongs)
      .catch(errorHandler)
  }

  /**
   * artist ID corresponds to its place in artists array + 1
   * if there is an album selected which does not belong to the newly
   * selected artist, we should unselect the album
   */
  @action.bound setArtistSelected (artistId) {
    const artistSelected = this._artists[artistId - 1]
    this.artistSelected = artistSelected
    this.albumSelected = null
    this.artistInSight = null

    if (!artistSelected.lastUpdated) {
      this.refreshArtist(artistSelected)
    }
  }

  /**
   * album ID corresponds to its place in albums array + 1
   * if there is a song selected which does not belong to the newly
   * selected artist, we should unselect the song
   */
  @action.bound setAlbumSelected (albumId) {
    const shouldUnselect = this.albumSelected
      ? this.filter && this.albumSelected._id === albumId
      : false

    if (this.songSelected) {
      this.songSelected = null
    }
    // Unselect album if it was already selected
    if (shouldUnselect) {
      if (this.filter || this.artistSelected) {
        this.albumSelected = null
      }
    }
    else {
      this.albumSelected = this._albums[albumId - 1]
    }
  }

  @action.bound setSongSelected (songId) {
    this.songSelected = this._songs[songId - 1]
  }

  /**
   * Clear artist, album, song selected and in sight.
   * Mainly used when search filter is updated.
   */
  @action.bound unselectAll () {
    this.artistSelected = null
    this.albumSelected = null
    this.songSelected = null
    this.artistInSight = null
    this.albumInSight = null
  }

  // This list is there to be able to ignore variants of characters in searches.
  static charRanges = {
    a: '[aáäâàå]',
    e: '[eéëêè]',
    i: '[iíïîì]',
    o: '[oöô]',
    u: '[uüû]',
    y: '[yýÝ]',
    l: '[lł]'
  }

  /**
   * The filter is set through user input, but the actual value stored is a
   * the user input as a regex that also ignore variants of characters. (eéêëè...)
   *
   * Note: the actual user input value is stored in the state of the searchbar.
   * @param {String} filter
   */
  @action.bound setSearchFilter (filter) {
    const utf8Filter = Array.prototype.map.call(filter, (char) => {
      return Library.charRanges[char] ? Library.charRanges[char] : char
    }).join('')

    this.filter = filter.length > 2 ? new RegExp(utf8Filter, 'i') : null
  }

  @action.bound clearAlbumInSight () {
    this.albumInSight = null
  }

  /**
   * Completely reset the library
   * @return {[type]} [description]
   */
  @action.bound resetStoreLibrary () {
    this.artistSelected = null
    this.albumSelected = null
    this.songSelected = null
    this._artists = []
    this._albums = []
    this._songs = []
  }

  @action.bound clearLibrary () {
    mediaLibrary.clearLibrary()
      .then(this.resetStoreLibrary)
      .catch(errorHandler)
  }

  constructor () {
    /**
     * Watch the search filter and focus / unfocus items in the library
     * If the filter is less precise (user is deleting), then if there is
     * something currently selected, it should stay selected.
     */
    this.observeDisposer = mobx.observe(this, 'filter', (change) => {
      const previousFilterLength = change.oldValue == null ? 0 : change.oldValue.source.length
      const newFilterLength = change.newValue == null ? 0 : change.newValue.source.length
      const isMore = newFilterLength > previousFilterLength
      const wasCleared = newFilterLength === 0 && previousFilterLength >= 2

      if (isMore) {
        this.unselectAll()
      }

      if (wasCleared) {
        if (this.songSelected) {
          this.albumSelected = this._albums[this.songSelected.albumID - 1]
        }

        if (this.albumSelected) {
          this.artistSelected = this._artists[this.albumSelected.artistID - 1]
          this.albumInSight = this.albumSelected._id
        }

        if (this.artistSelected) {
          this.artistInSight = this.artistSelected._id
        }
      }
    })
  }
}

class Scan {
  @observable timeElapsed = 0
  @observable inProgress = false
  @observable found = 0
  @observable processed = 0

  /**
   * Set the progress state from the media library scanner
   */
  @action.bound updateScanProgress () {
    const progress = mediaLibrary.scanner.getProgress()
    this.found = progress.found
    this.processed = progress.processed
  }

  @action.bound stopScan () {
    mediaLibrary.stopScan()
  }
}

export default class KaikuStore {
  appName = 'Kaiku'

  library = new Library()
  scan = new Scan()
  player = new Player()
  playlist = new Playlist()
  settings

  @observable.ref songPlaying = null
  @observable.ref albumPlaying = null
  @observable.ref artistPlaying = null

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
   * @param  {Object} options   {configService}
   */
  constructor (options) {
    this.settings = new Settings(options)
    /**
     * Setup some actions that should happen based on the player lib events.
     */
    musicPlayer.on('play', this.setSongPlaying)
  }
}
