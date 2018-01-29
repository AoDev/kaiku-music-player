/**
 * Library service
 *
 * Find artists, albums, songs from source (DB)
 */

import WebSQL from '../WebSQL'
import {remote} from 'electron'

const fs = remote.require('fs')
const path = remote.require('path')
const mm = remote.require('musicmetadata')
const scanner = remote.require('./lib/libraryScanner')

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
  createSongsTable: 'CREATE TABLE IF NOT EXISTS songs (_id INTEGER PRIMARY KEY, title VARCHAR, artistID INTEGER, albumID INTEGER, trackNr INTEGER, filePath VARCHAR)',
  findAlbumById: 'SELECT _id, title, artistID, cover, year FROM albums WHERE _id = ?',
  findAlbumFirstSong: 'SELECT _id, filePath FROM songs WHERE albumID = ? LIMIT 1',
  findAlbums: 'SELECT _id, title, artistID, cover, year FROM albums ORDER BY _id',
  findArtistSongs: 'SELECT _id, title, artistID, albumID, trackNr, filePath FROM songs WHERE artistID = ?',
  findArtistAlbums: 'SELECT _id, title, artistID, cover, year FROM albums WHERE artistID = ?',
  findArtistById: 'SELECT _id, name, lastUpdated FROM artists WHERE _id = ?',
  findArtists: 'SELECT _id, name, lastUpdated FROM artists ORDER BY _id',
  findSongs: 'SELECT _id, title, artistID, albumID, trackNr, filePath FROM songs ORDER BY _id',
  findSong: 'SELECT _id, title, artistID, albumID, trackNr, filePath FROM songs WHERE _id = ?',
  saveAlbum: 'INSERT INTO albums (title, artistID, cover, year) VALUES (?, ?, ?, ?)',
  saveArtist: 'INSERT INTO artists (name) VALUES (?)',
  saveSong: 'INSERT INTO songs (title, artistID, albumID, trackNr, filePath) VALUES (?, ?, ?, ?, ?)',
  updateAlbum: 'UPDATE albums SET title = ?, artistID = ?, cover = ?, year = ? WHERE _id = ?',
  updateArtist: 'UPDATE artists SET name = ?, lastUpdated = ? WHERE _id = ?',
  updateSong: 'UPDATE songs SET title = ?, artistID = ?, albumID = ?, trackNr = ?, filePath = ? WHERE _id = ?'
}

var kaikuDB

function init () {
  // Always create cover folder if it does not exists
  if (!fs.existsSync(COVER_FOLDER)) {
    console.log('Creating covers cache dir...')
    fs.mkdir(COVER_FOLDER)
  }
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
    filePath: metadata.filePath
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
      scanner.scanSongsDir(nextFolder, saveToLibrary, scanNextFolder)
    }
    else {
      scanner.scanSongsDir(nextFolder, saveToLibrary, () => {
        onScanComplete(null, library)
        library._artists.forEach((artist) => saveArtistToDb([artist.name]))
        library._albums.forEach((album) => saveAlbumToDb([album.title, album.artistID, album.cover, album.year]))
        library._songs.forEach((song) => saveSongToDb([song.title, song.artistID, song.albumID, song.trackNr, song.filePath]))
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

function refreshSongData (songID) {
  return kaikuDB.queryOne(sql.findSong, [songID])
  .then((song) => {
    return Promise.all([
      song,
      readMetadata(song.filePath)
    ])
  })
  .then((results) => {
    const song = results[0]
    const metadata = results[1]
    song.title = metadata.title
    song.trackNr = metadata.track.no || 0
    kaikuDB.query(sql.updateSong, [song.title, song.artistID, song.albumID, song.trackNr, song.filePath, songID])
    return song
  })
  .catch((err) => {
    console.log(err)
  })
}

function readMetadata (filePath) {
  return new Promise(function (resolve, reject) {
    const stream = fs.createReadStream(filePath)
    mm(stream, function (err, metadata) {
      if (err) {
        reject(err)
      }
      else {
        stream.close()
        resolve(metadata)
      }
    })
  })
}

/**
 * Save a cached version of an album cover to the disk
 * @param  {[type]} albumId   [description]
 * @param  {[type]} imgBuffer [description]
 * @return {[type]}           [description]
 */
function saveCover (albumId, format, imgBuffer) {
  var filename = path.join(COVER_FOLDER, albumId + '.' + format)
  fs.writeFileSync(filename, imgBuffer)
  return filename
}

function refreshAlbumData (albumID) {
  return kaikuDB.queryOne(sql.findAlbumFirstSong, [albumID])
  .then((song) => {
    return Promise.all([
      kaikuDB.queryOne(sql.findAlbumById, [albumID]),
      readMetadata(song.filePath)
    ])
  })
  .then((results) => {
    const album = results[0]
    const metadata = results[1]
    const coverFormat = metadata.picture.length ? metadata.picture[0].format : null

    if (coverFormat) {
      album.cover = coverFormat
      kaikuDB.query(sql.updateAlbum, [album.title, album.artistID, coverFormat, album.year, albumID])
      let filename = saveCover(albumID, coverFormat, metadata.picture[0].data)
      return filename
    }
    else {
      return null
    }
  })
}

function stopScan () {
  scanner.stopScan()
}

export default {
  init,
  findArtists,
  findAlbums,
  findSongs,
  scanner,
  scan,
  stopScan,
  clearLibrary,
  refreshAlbumData,
  refreshArtistData,
  refreshArtistSongs,
  refreshSongData,
  COVER_FOLDER,
  COVER_DEFAULT
}
