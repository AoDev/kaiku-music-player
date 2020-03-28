/**
 * @module libraryScanner
 */

const mm = require('music-metadata')
const filewalker = require('filewalker')
const fastq = require('fastq')

var processed = 0
var found = 0
var q = null

/* MM Format
{ artist : 'Spor',
  album : 'Nightlife, Vol 5.',
  albumartist : [ 'Andy C', 'Spor' ],
  title : 'Stronger',
  year : '2010',
  track : { no : 1, of : 44 },
  disk : { no : 1, of : 2 },
  genre : ['Drum & Bass'],
  picture : [ { format : 'jpg', data : <Buffer> } ],
  duration : 302 // in seconds
}
*/

function readMetadata (filePath, options = {}) {
  return mm.parseFile(filePath, options)
    .then((metadata) => {
      if (metadata.format.duration) {
        metadata.common.duration = metadata.format.duration
      }
      metadata.common.artist = metadata.common.artist || (metadata.common.artists && metadata.common.artists.join(' / '))
      metadata.common.filePath = filePath
      return metadata.common
    })
}

const batchScanOptions = {skipCovers: true, mergeTagHeaders: true}

/**
 * Traverse recursively a directory to scan song files and build DB
 * @param  {[type]} songsDir directory to scan
 *
 * Use an in memory queue to handle the songs data process.
 * onAllFilesFound will be called when all the files have been added
 * to the queue, waiting to be processes (read id3 tags etc)
 *
 * onScanComplete is called when all audio files found have been processed
 *
 * Note: currently it resets the library before scanning.
 * This behaviour should change in the future
 */
function scanSongsDir (songsDir, onSongData, onScanComplete) {
  processed = 0
  found = 0

  function processSongFile (songFilePath, qNext) {
    // process.stdout.write(processed + '/' + found + '\r')
    readMetadata(songFilePath, batchScanOptions)
      .then((metadata) => {
        onSongData(metadata, qNext)
      })
      .catch(() => qNext())
      .finally(() => processed++)
  }

  q = fastq(processSongFile, 1)

  function addToQueue (p, s, fullPath) {
    q.push(fullPath)
  }

  function handleError (err) {
    console.log(err)
    onScanComplete(err)
  }

  function onAllFilesFound () {
    q.drain = onScanComplete
    found = this.files
  }

  filewalker(songsDir)
    .on('file', addToQueue)
    .on('error', handleError)
    .on('done', onAllFilesFound)
    .walk()
}

function stopScan () {
  q.killAndDrain()
}

/**
 * [getProgress description]
 * @return {[type]} [description]
 */
function getProgress () {
  return {
    found: found,
    processed: processed
  }
}

module.exports = {
  getProgress,
  readMetadata,
  scanSongsDir,
  stopScan,
}
