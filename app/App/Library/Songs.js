import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer, inject} from 'mobx-react'
import libraryContextMenus from './libraryContextMenus'

export class Songs extends Component {
  /**
   * Scrap song id from DOM
   * @param  {DOM node} eTarget clicked element
   * @return {String}   song id
   */
  static getSongId (eTarget) {
    if (eTarget.nodeName !== 'LI') {
      return parseInt(eTarget.parentNode.dataset.songid, 10)
    }
    return parseInt(eTarget.dataset.songid, 10)
  }

  /**
   * Generate the list of songs to be displayed
   * @return {Array} Array of songs
   */
  static listSongsToDisplay ({songPlaying, library}) {
    const songPlayingId = songPlaying ? songPlaying._id : null
    const needDetails = library.filter && library.artistSelected === null

    return library.songs.map((song) => {
      var cssClasses = null

      if (library.songSelected === song) {
        cssClasses = songPlayingId === song._id ? 'selected playing' : 'selected'
      }
      else if (songPlayingId === song._id) {
        cssClasses = 'playing'
      }

      return (
        <li key={song._id} data-songid={song._id} className={cssClasses}>
          {song.trackNr + '. ' + song.title}
          {needDetails
            ? <div className="search-help">{library._artists[song.artistID - 1].name + ' - ' + library._albums[song.albumID - 1].title}</div>
            : null
          }
        </li>
      )
    })
  }

  constructor (props) {
    super(props)
    this.state = {
      artistSelected: null,
      songSelected: null
    }
    this.selectSong = this.selectSong.bind(this)
    this.playSong = this.playSong.bind(this)
    this.createMenu = this.createMenu.bind(this)
  }

  /**
   * When a song is clicked, pass its id to the whole library
   * @param  {Event} e [description]
   */
  selectSong (event) {
    this.props.onSongSelected(Songs.getSongId(event.target))
  }

  /**
   * When a song is doubleClicked, add its songs to playlist and start playing
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  playSong (event) {
    this.props.playSong(Songs.getSongId(event.target))
  }

  createMenu (event) {
    const songID = Songs.getSongId(event.target)
    const actions = {
      addSongToPlaylist: this.props.addSongToPlaylist
    }
    libraryContextMenus.showSongMenu(songID, actions)
  }

  render () {
    return (
      <div className="songs">
        <ul tabIndex="4"
          onClick={this.selectSong}
          onDoubleClick={this.playSong}
          onContextMenu={this.createMenu}>
          {Songs.listSongsToDisplay(this.props)}
        </ul>
      </div>
    )
  }
}

export default inject(({store}) => ({
  library: store.library,
  playSong: store.playSong,
  songPlaying: store.songPlaying,
  addSongToPlaylist: store.addSongToPlaylist,
  onSongSelected: store.library.setSongSelected
}))(observer(Songs))

Songs.propTypes = {
  library: PropTypes.shape({
    songs: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.number,
      albumID: PropTypes.number,
      artistID: PropTypes.number,
      title: PropTypes.string,
      trackNr: PropTypes.number
    })),
    songSelected: PropTypes.shape({
      _id: PropTypes.number.isRequired
    }),
    refreshSongData: PropTypes.func.isRequired,
    artistSelected: PropTypes.shape({}),
    filter: PropTypes.instanceOf(RegExp)
  }),
  songPlaying: PropTypes.shape({
    _id: PropTypes.number.isRequired
  }),
  onSongSelected: PropTypes.func.isRequired,
  playSong: PropTypes.func.isRequired,
  addSongToPlaylist: PropTypes.func.isRequired
}
