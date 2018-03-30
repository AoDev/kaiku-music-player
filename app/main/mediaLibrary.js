const fs = require('fs')
const mm = require('musicmetadata')

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

module.exports = {
  readMetadata,
  refreshSongsDuration,
}
