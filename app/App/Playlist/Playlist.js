import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer, inject} from 'mobx-react'
import playlistContextMenu from './playlistContextMenu'

export class Playlist extends Component {
  /**
   * Generate the list of songs to be displayed
   * @return {Array} Array of songs
   */
  static listSongsToDisplay ({playlist, songPlaying}) {
    const songPlayingId = songPlaying ? songPlaying._id : null
    // const needDetails = props.filter && props.artistSelected === null
    const songs = playlist.songs

    return songs.map((song, index) => {
      var cssClasses = null

      if (playlist.songsSelected.indexOf(song._id) > -1) {
        cssClasses = songPlayingId === song._id ? 'selected playing' : 'selected'
      }
      else if (songPlayingId === song._id) {
        cssClasses = 'playing'
      }

      return (
        <li key={`${song._id}-${index}`} data-song-id={song._id} data-index={index} className={cssClasses}>
          {song.trackNr + '. ' + song.title}
        </li>
      )
    })
  }

  constructor (props) {
    super(props)
    this.playSong = this.playSong.bind(this)
    this.createMenu = this.createMenu.bind(this)
    this.setSongSelectedInPlaylist = this.setSongSelectedInPlaylist.bind(this)
  }

  playSong (event) {
    const index = parseInt(event.target.dataset.index, 10)
    this.props.playSongFromPlaylist(index)
  }

  createMenu (event) {
    const songID = parseInt(event.target.dataset.songId, 10)
    const actions = {
      removeFromPlaylist: this.props.playlist.removeFromPlaylist
    }
    playlistContextMenu.showPlaylistMenu(songID, actions)
    this.props.playlist.setSongsSelected([songID])
  }

  setSongSelectedInPlaylist (event) {
    const songID = parseInt(event.target.dataset.songId, 10)
    this.props.playlist.setSongsSelected([songID])
  }

  render () {
    const {playlist} = this.props
    return (
      <div className="playlist">
        <h3>Playlist
          <button type="text" disabled={playlist.songs.length === 0}
            className="btn-inverse btn-narrow float-right"
            onClick={playlist.emptyPlaylist}>Empty
          </button>
        </h3>
        <div className="songs">
          <ul tabIndex="5"
            onClick={this.setSongSelectedInPlaylist}
            onDoubleClick={this.playSong}
            onContextMenu={this.createMenu}>
            {Playlist.listSongsToDisplay(this.props)}
          </ul>
        </div>
      </div>
    )
  }
}

export default inject(({store}) => ({
  songPlaying: store.songPlaying,
  playlist: store.playlist,
  playSongFromPlaylist: store.playSongFromPlaylist
}))(observer(Playlist))

Playlist.propTypes = {
  playSongFromPlaylist: PropTypes.func.isRequired,
  songPlaying: PropTypes.shape({
    _id: PropTypes.number
  }),
  playlist: PropTypes.shape({
    songs: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.number.isRequired
    })).isRequired,
    emptyPlaylist: PropTypes.func.isRequired,
    songsSelected: PropTypes.arrayOf(PropTypes.number).isRequired,
    setSongsSelected: PropTypes.func.isRequired,
    removeFromPlaylist: PropTypes.func.isRequired
  }).isRequired
}
