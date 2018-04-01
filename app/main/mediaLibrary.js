const fs = require('fs')
const mm = require('musicmetadata')
const path = require('path')
const electron = require('electron')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)

const COVER_FOLDER = path.join(electron.app.getPath('userData'), 'covers')

function readMetadata (filePath) {
  return new Promise(function (resolve, reject) {
    const stream = fs.createReadStream(filePath)
    mm(stream, {duration: true}, function (err, metadata) {
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

async function refreshSongsDuration (songs) {
  const songsMetadata = await Promise.all(songs.map((song) => readMetadata(song.filePath)))

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
  const songMetadata = await readMetadata(song.filePath)
  const hasPicture = songMetadata.picture.length > 0

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
  readMetadata,
  refreshSongsDuration,
}
