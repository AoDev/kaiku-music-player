/**
 * Library service
 *
 * Find artists, albums, songs from source (DB)
 */

import {WebSQL} from 'app-utils'

/**
 * Artists, Albums and Songs must be ordered by _id.
 * This is a trick for the app. This allows to build arrays in memory to
 * access quickly data by their id.
 */
const sql = {
  createAlbumsTable: 'CREATE TABLE IF NOT EXISTS albums (_id INTEGER PRIMARY KEY, title VARCHAR, artistID INTEGER, cover VARCHAR, year INTEGER)',
  createArtistsTable: 'CREATE TABLE IF NOT EXISTS artists (_id INTEGER PRIMARY KEY, name VARCHAR, lastUpdated VARCHAR)',
  createSongsTable: 'CREATE TABLE IF NOT EXISTS songs (_id INTEGER PRIMARY KEY, title VARCHAR, artistID INTEGER, albumID INTEGER, trackNr INTEGER, filePath VARCHAR, duration REAL DEFAULT 0)',
  findAlbumById: 'SELECT _id, title, artistID, cover, year FROM albums WHERE _id = ?',
  findAlbumFirstSong: 'SELECT _id, title, artistID, albumID, trackNr, filePath, duration FROM songs WHERE albumID = ? LIMIT 1',
  findAllAlbums: 'SELECT _id, title, artistID, cover, year FROM albums ORDER BY _id',
  findArtistSongs: 'SELECT _id, title, artistID, albumID, trackNr, filePath FROM songs WHERE artistID = ?',
  findArtistAlbums: 'SELECT _id, title, artistID, cover, year FROM albums WHERE artistID = ?',
  findArtistById: 'SELECT _id, name, lastUpdated FROM artists WHERE _id = ?',
  findAllArtists: 'SELECT _id, name, lastUpdated FROM artists ORDER BY _id',
  findAllSongs: 'SELECT _id, title, artistID, albumID, trackNr, filePath, duration FROM songs ORDER BY _id',
  findSongById: 'SELECT _id, title, artistID, albumID, trackNr, filePath, duration FROM songs WHERE _id = ?',
  saveAlbum: 'INSERT INTO albums (title, artistID, cover, year) VALUES (?, ?, ?, ?)',
  saveArtist: 'INSERT INTO artists (name) VALUES (?)',
  saveSong: 'INSERT INTO songs (title, artistID, albumID, trackNr, filePath, duration) VALUES (?, ?, ?, ?, ?, ?)',
  updateAlbum: 'UPDATE albums SET title = ?, artistID = ?, cover = ?, year = ? WHERE _id = ?',
  updateArtist: 'UPDATE artists SET name = ?, lastUpdated = ? WHERE _id = ?',
  updateSong: 'UPDATE songs SET title = ?, artistID = ?, albumID = ?, trackNr = ?, filePath = ?, duration = ? WHERE _id = ?'
}

/**
 * Create a db for media library persistence
 */
export default class MediaLibraryDb {
  /**
   * Instantiate db, "init" must be called after.
   */
  constructor () {
    // Open DB and create tables
    this.kaikuDB = new WebSQL({
      name: 'kaiku',
      description: 'Kaiku database',
      estimatedSize: 16 * 1024 * 1024
    })
  }

  /**
   * Setup tables
   */
  init () {
    return Promise.all([
      this.kaikuDB.query(sql.createSongsTable),
      this.kaikuDB.query(sql.createAlbumsTable),
      this.kaikuDB.query(sql.createArtistsTable)
    ])
  }

  /**
   * Delete all records and tables from the DB
   */
  clearLibrary () {
    return Promise.all([
      this.kaikuDB.dropTable('songs'),
      this.kaikuDB.dropTable('albums'),
      this.kaikuDB.dropTable('artists')
    ])
  }

  /**
   * Returns all artists from db
   * @returns {Promise} Promised array of artists
   */
  findAllArtists () {
    return this.kaikuDB.queryArray(sql.findAllArtists)
  }

  /**
   * Returns all albums from db
   * @returns {Promise} Promised array of albums
   */
  findAllAlbums () {
    return this.kaikuDB.queryArray(sql.findAllAlbums)
  }

  /**
   * Returns all songs from db
   * @returns {Promise} Promised array of songs
   */
  findAllSongs () {
    return this.kaikuDB.queryArray(sql.findAllSongs)
  }

  findArtistAlbums () {
  }

  /**
   * Save an artist to the db
   * @param  {Array} artistData [artistName]
   * @return {Promise}
   */
  saveArtist (artistData) {
    return this.kaikuDB.query(sql.saveArtist, artistData)
      .then((results) => results.insertId)
  }

  /**
   * Save an album to the db
   * @param  {Array} albumData [albumTitle, artistID, coverFormat, year]
   * @return {Promise}
   */
  saveAlbum (albumData) {
    return this.kaikuDB.query(sql.saveAlbum, albumData)
      .then((results) => results.insertId)
  }

  /**
   * Save a song to the db
   * @param  {Array} songData [title, artistID, albumID, trackNr, filePath]
   * @return {Promise}
   */
  saveSong (songData) {
    return this.kaikuDB.query(sql.saveSong, songData)
  }

  /**
   * Update a list of songs
   * @param {Array} updatedSongs
   */
  updateSongs (updatedSongs) {
    return Promise.all(updatedSongs.map((song, index) =>
      this.kaikuDB.query(
        sql.updateSong,
        [song.title, song.artistID, song.albumID, song.trackNr, song.filePath, song.duration, song._id]
      )
    ))
  }
}
