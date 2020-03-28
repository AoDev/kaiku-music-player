import * as mobx from 'mobx'
import _ from 'lodash'
import MediaLibraryDb from 'app-lib/MediaLibraryDb'
import {mediaLibrary} from 'app-services'

const {observable, action, computed} = mobx

function logError (err) {
  console.log(err)
}

export default class Library {
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

  @action.bound set (prop, value) {
    this[prop] = value
  }

  @action.bound assign (props) {
    Object.assign(this, props)
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
      .catch(logError)

    mediaLibrary.findAlbums()
      .then(this.setAlbums)
      .catch(logError)

    mediaLibrary.findSongs()
      .then(this.setSongs)
      .then(mobx.action(() => {
        this.isLoaded = true
      }))
      .catch(logError)
  }

  /**
   * Pull all albums from the medialibrary DB and reset them
   * TODO: this is not performant at all and should be refactored
   */
  @action.bound async reloadAlbums () {
    const albums = await mediaLibrary.findAlbums()
    this.setAlbums(albums)
    return albums
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
      .then(this.reloadAlbums)
      .catch(logError)
  }

  @action.bound async refreshAlbumData (albumID) {
    try {
      await mediaLibrary.refreshAlbumData(albumID)
      this.reloadAlbums()
    }
    catch (err) {
      window.alert(`Sorry, the update failed. [${err.message}]`)
    }
  }

  @action.bound refreshSongData (songID) {
    return mediaLibrary
      .refreshSongData(songID)
      .then(mediaLibrary.findSongs)
      .then(this.setSongs)
      .catch(logError)
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
      .catch(logError)
  }

  constructor () {
    this.db = new MediaLibraryDb()

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
