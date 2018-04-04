const fs = require('fs')
const path = require('path')
const electron = require('electron')
const util = require('util')
const libraryScanner = require('./libraryScanner')

const writeFile = util.promisify(fs.writeFile)

const COVER_FOLDER = path.join(electron.app.getPath('userData'), 'covers')

function init () {
  // Always create cover folder if it does not exists
  if (!fs.existsSync(COVER_FOLDER)) {
    console.log('Creating covers cache dir...')
    fs.mkdir(COVER_FOLDER)
  }
}

async function refreshSongsDuration (songs) {
  const songsMetadata = await Promise.all(
    songs.map((song) => libraryScanner.readMetadata(song.filePath, {duration: true}))
  )

  return songs.map((song, index) => {
    song.duration = songsMetadata[index].duration
    return song
  })
}

/**
 * Given a song data, try to extract the album cover from its file metadata
 * @param {Object} song {filePath, albumID}
 * @returns {Promise Object} extract result {pictureFormat, coverFilePath} | null
 */
async function extractCoverFromSong (song) {
  const songMetadata = await libraryScanner.readMetadata(song.filePath, {mergeTagHeaders: true})
  const hasPicture = Array.isArray(songMetadata.picture) && songMetadata.picture.length > 0

  if (hasPicture) {
    const picture = songMetadata.picture[0]
    const coverFilePath = path.join(COVER_FOLDER, song.albumID + '.' + picture.format)
    await writeFile(coverFilePath, picture.data)
    return {pictureFormat: picture.format, coverFilePath}
  }
  return null
}

module.exports = {
  extractCoverFromSong,
  init,
  refreshSongsDuration,
}
