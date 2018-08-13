import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer, inject} from 'mobx-react'
import playlistContextMenu from './playlistContextMenu'

export class Playlist extends Component {
  /**
   * Generate a string for a time in seconds. like 6:30
   * @param  {Number} seconds
   * @return {String}
   */
  static convertTime (seconds) {
    var minutes = Math.floor(seconds / 60)
    var _seconds = Math.floor(seconds % 60)
    return `${minutes}:${_seconds < 10 ? '0' : ''}${_seconds}`
  }

  static getSongIndex (clickEvent) {
    let dataset = clickEvent.target.dataset
    if (typeof dataset.index === 'undefined') {
      dataset = clickEvent.target.parentNode.dataset
    }
    return parseInt(dataset.index, 10)
  }

  static getSongId (clickEvent) {
    let dataset = clickEvent.target.dataset
    if (typeof dataset.songId === 'undefined') {
      dataset = clickEvent.target.parentNode.dataset
    }
    return parseInt(dataset.songId, 10)
  }

  constructor (props) {
    super(props)
    this.playSong = this.playSong.bind(this)
    this.createMenu = this.createMenu.bind(this)
    this.setSongSelectedInPlaylist = this.setSongSelectedInPlaylist.bind(this)
  }

  playSong (event) {
    this.props.player.playFromPlaylistAt(Playlist.getSongIndex(event))
  }

  createMenu (event) {
    const {player, uiStore} = this.props
    const songIndex = Playlist.getSongIndex(event)
    const actions = {
      removeFromPlaylist () {
        player.removeSongsFromPlaylist([songIndex])
      }
    }
    uiStore.setSongSelectedInPlaylist(songIndex)
    playlistContextMenu.showPlaylistMenu(actions)
  }

  setSongSelectedInPlaylist (event) {
    const songIndex = Playlist.getSongIndex(event)
    this.props.uiStore.setSongSelectedInPlaylist(songIndex)
  }

  render () {
    const {playlist, uiStore} = this.props
    return (
      <div className="playlist">
        <h3>Playlist
          <button type="text" disabled={playlist.songs.length === 0}
            className="btn-inverse btn-narrow float-right"
            onClick={playlist.clear}>Empty
          </button>
        </h3>
        <div className="songs">
          <ul tabIndex="5"
            onClick={this.setSongSelectedInPlaylist}
            onDoubleClick={this.playSong}
            onContextMenu={this.createMenu}>
            {playlist.songs.map((song, index) => {
              var cssClasses = null

              if (uiStore.indexOfSongSelectedInPlaylist === index) {
                cssClasses = playlist.currentIndex === index ? 'selected playing' : 'selected'
              }
              else if (playlist.currentIndex === index) {
                cssClasses = 'playing'
              }
              return (
                <li key={`${song._id}-${index}`} data-song-id={song._id} data-index={index} className={cssClasses}>
                  <span className="playlist-title">{song.trackNr + '. ' + song.title}</span>
                  <span className="playlist-duration">{song.duration > 0 ? Playlist.convertTime(song.duration) : ''}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }
}

export default inject(({appStore, uiStore}) => ({
  uiStore,
  player: appStore.player,
  songPlaying: appStore.songPlaying,
  playlist: appStore.player.playlist,
}))(observer(Playlist))

Playlist.propTypes = {
  uiStore: PropTypes.shape({
    indexOfSongSelectedInPlaylist: PropTypes.number.isRequired,
    setSongSelectedInPlaylist: PropTypes.func.isRequired,
  }).isRequired,
  player: PropTypes.shape({
    playFromPlaylistAt: PropTypes.func.isRequired,
    removeSongsFromPlaylist: PropTypes.func.isRequired,
  }).isRequired,
  playlist: PropTypes.shape({
    songs: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.number.isRequired
    })).isRequired,
    clear: PropTypes.func.isRequired,
    removeSongsAt: PropTypes.func.isRequired,
  }).isRequired
}
