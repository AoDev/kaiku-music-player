/**
 * Library service
 *
 * Find artists, albums, songs from source (DB)
 */

import WebSQL from '../WebSQL'
import {remote} from 'electron'
import ipcpRenderer from '../../utils/ipcpRenderer'

const path = remote.require('path')
const main = remote.require('./main')
const {libraryScanner} = main

export const COVER_FOLDER = path.join(remote.app.getPath('userData'), 'covers')
export const COVER_DEFAULT = './images/default-cover.svg'

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
  findAlbums: 'SELECT _id, title, artistID, cover, year FROM albums ORDER BY _id',
  findArtistSongs: 'SELECT _id, title, artistID, albumID, trackNr, filePath FROM songs WHERE artistID = ?',
  findArtistAlbums: 'SELECT _id, title, artistID, cover, year FROM albums WHERE artistID = ?',
  findArtistById: 'SELECT _id, name, lastUpdated FROM artists WHERE _id = ?',
  findArtists: 'SELECT _id, name, lastUpdated FROM artists ORDER BY _id',
  findSongs: 'SELECT _id, title, artistID, albumID, trackNr, filePath, duration FROM songs ORDER BY _id',
  findSong: 'SELECT _id, title, artistID, albumID, trackNr, filePath, duration FROM songs WHERE _id = ?',
  saveAlbum: 'INSERT INTO albums (title, artistID, cover, year) VALUES (?, ?, ?, ?)',
  saveArtist: 'INSERT INTO artists (name) VALUES (?)',
  saveSong: 'INSERT INTO songs (title, artistID, albumID, trackNr, filePath, duration) VALUES (?, ?, ?, ?, ?, ?)',
  updateAlbum: 'UPDATE albums SET title = ?, artistID = ?, cover = ?, year = ? WHERE _id = ?',
  updateArtist: 'UPDATE artists SET name = ?, lastUpdated = ? WHERE _id = ?',
  updateSong: 'UPDATE songs SET title = ?, artistID = ?, albumID = ?, trackNr = ?, filePath = ?, duration = ? WHERE _id = ?'
}

var kaikuDB

function init () {
  // Open DB and create tables
  kaikuDB = new WebSQL({
    name: 'kaiku',
    description: 'Kaiku database',
    estimatedSize: 16 * 1024 * 1024
  })
  return Promise.all([
    kaikuDB.query(sql.createSongsTable),
    kaikuDB.query(sql.createAlbumsTable),
    kaikuDB.query(sql.createArtistsTable)
  ])
}

function clearLibrary () {
  return Promise.all([
    kaikuDB.dropTable('songs'),
    kaikuDB.dropTable('albums'),
    kaikuDB.dropTable('artists')
  ])
}

function findArtists () {
  return kaikuDB.queryArray(sql.findArtists)
}

function findAlbums () {
  return kaikuDB.queryArray(sql.findAlbums)
}

function findSongs () {
  return kaikuDB.queryArray(sql.findSongs)
}

/**
 * Save an artist to the db
 * @param  {Array} artistData [artistName]
 * @return {Promise}
 */
function saveArtistToDb (artistData) {
  return kaikuDB.query(sql.saveArtist, artistData)
    .then((results) => results.insertId)
}

/**
 * Save an album to the db
 * @param  {Array} albumData [albumTitle, artistID, coverFormat, year]
 * @return {Promise}
 */
function saveAlbumToDb (albumData) {
  return kaikuDB.query(sql.saveAlbum, albumData)
    .then((results) => results.insertId)
}

/**
 * Save a song to the db
 * @param  {Array} songData [title, artistID, albumID, trackNr, filePath]
 * @return {Promise}
 */
function saveSongToDb (songData) {
  return kaikuDB.query(sql.saveSong, songData)
}

// These are all used for the scanning
var scanTree = {}
var library = {
  _artists: [],
  _albums: [],
  _songs: []
}
var artistInc = 1
var albumInc = 1
var songInc = 1

/**
 * Save artist, album, song in DB from file metadata
 * @param  {Object}   metadata Song metadata (mp3 tag)
 * @param  {Function} next     Must be called to process next song, when done
 */
function saveToLibrary (metadata, next) {
  const artistName = metadata.artist[0] || 'unknown'
  const albumTitle = metadata.album || 'unknown'
  var artist = scanTree[artistName]

  if (!artist) {
    artist = scanTree[artistName] = {
      name: artistName,
      _id: artistInc
    }
    library._artists.push(artist)
    artistInc++
  }

  var album = artist[albumTitle]
  if (!album) {
    album = artist[albumTitle] = {
      _id: albumInc,
      title: albumTitle,
      artistID: artist._id,
      cover: null, // we will load covers later
      year: metadata.year
    }
    library._albums.push(album)
    albumInc++
  }

  library._songs.push({
    _id: songInc,
    title: metadata.title || 'unknown',
    artistID: artist._id,
    albumID: album._id,
    trackNr: metadata.track.no || 0,
    filePath: metadata.filePath,
    duration: 0,
  })
  songInc++

  next()
}

function scan (songsFolders, onScanComplete) {
  var folderIndex = 0
  scanTree = {}
  artistInc = 1
  albumInc = 1
  songInc = 1
  library = {
    _artists: [],
    _albums: [],
    _songs: []
  }

  function scanNextFolder () {
    const nextFolder = songsFolders[folderIndex]
    console.log(`Scanning for songs in ${nextFolder}...`)
    if (folderIndex < songsFolders.length - 1) {
      folderIndex++
      libraryScanner.scanSongsDir(nextFolder, saveToLibrary, scanNextFolder)
    }
    else {
      libraryScanner.scanSongsDir(nextFolder, saveToLibrary, () => {
        onScanComplete(null, library)
        library._artists.forEach((artist) => saveArtistToDb([artist.name]))
        library._albums.forEach((album) => saveAlbumToDb([album.title, album.artistID, album.cover, album.year]))
        library._songs.forEach((song) => saveSongToDb([song.title, song.artistID, song.albumID, song.trackNr, song.filePath, song.duration]))
      })
    }
  }

  scanNextFolder()
}

function refreshArtistData (artistID) {
  return kaikuDB.queryArray(sql.findArtistAlbums, [artistID])
    .then((albums) => {
      return Promise.all(albums.map((album) => refreshAlbumData(album._id)))
    })
    .then(() => kaikuDB.queryOne(sql.findArtistById, [artistID]))
    .then((artist) => {
      artist.lastUpdated = new Date().toISOString()
      kaikuDB.query(sql.updateArtist, [artist.name, artist.lastUpdated, artistID])
      return artist
    })
}

function refreshArtistSongs (artistID) {
  return kaikuDB.queryArray(sql.findArtistSongs, [artistID])
    .then((songs) => {
      console.log(songs)
    })
  // .then((albums) => {
  //   return Promise.all(albums.map((album) => refreshAlbumData(album._id)))
  // })
}

async function refreshSongData (songID) {
  const song = await kaikuDB.queryOne(sql.findSong, [songID])
  const metadata = await ipcpRenderer.sendMain('getSongMetadata', song.filePath)
  song.title = metadata.title
  song.trackNr = metadata.track.no || 0
  kaikuDB.query(sql.updateSong, [song.title, song.artistID, song.albumID, song.trackNr, song.filePath, song.duration, songID])
  return song
}

async function updateSongs (updatedSongs) {
  return Promise.all(updatedSongs.map((song, index) =>
    kaikuDB.query(
      sql.updateSong,
      [song.title, song.artistID, song.albumID, song.trackNr, song.filePath, song.duration, song._id]
    )
  ))
}

/**
 * Refresh / update an album data given its ID.
 * - Get its cover.
 * @param {Number} albumID
 * @returns {Promise} Resolve with the cover extract result
 */
async function refreshAlbumData (albumID) {
  const [album, firstSong] = await Promise.all([
    kaikuDB.queryOne(sql.findAlbumById, [albumID]),
    kaikuDB.queryOne(sql.findAlbumFirstSong, [albumID])
  ])

  const extractResult = await ipcpRenderer.sendMain('extractCoverFromSong', firstSong)
  if (extractResult !== null) {
    album.cover = extractResult.pictureFormat
    kaikuDB.query(sql.updateAlbum, [album.title, album.artistID, album.cover, album.year, albumID])
  }

  return extractResult
}

function stopScan () {
  libraryScanner.stopScan()
}

export default {
  clearLibrary,
  COVER_DEFAULT,
  COVER_FOLDER,
  findAlbums,
  findArtists,
  findSongs,
  init,
  refreshAlbumData,
  refreshArtistData,
  refreshArtistSongs,
  refreshSongData,
  scan,
  libraryScanner,
  stopScan,
  updateSongs,
}
