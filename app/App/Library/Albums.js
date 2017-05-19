import PropTypes from 'prop-types'
import React, {Component} from 'react'
import _ from 'lodash'
import {COVER_FOLDER, COVER_DEFAULT} from '../../lib/mediaLibrary'
import {observer, inject} from 'mobx-react'
import libraryContextMenus from './libraryContextMenus'

export class Albums extends Component {
  /**
   * Scrap album id from DOM
   * Needed because it's using event delegation on the ul item
   * @param  {DOM node} eTarget clicked element
   * @return {String}   album id
   */
  static getAlbumId (eTarget) {
    if (eTarget.nodeName !== 'LI') {
      return parseInt(eTarget.parentNode.dataset.albumid)
    }
    return parseInt(eTarget.dataset.albumid)
  }

  /**
   * Scroll the artists list to a given album so that's it's in sight
   * @param  {DOM element} albumsDomNode
   * @param  {Number} albumId
   */
  static jumpToAlbum (albumsDomNode, albumId) {
    const nodes = albumsDomNode.querySelectorAll('[data-albumid="' + albumId + '"]')
    if (nodes.length) {
      setTimeout(function () {
        albumsDomNode.scrollTop = nodes[0].offsetTop - albumsDomNode.offsetTop
      }, 100)
    }
  }

  /**
   * Generate the list of albums to be displayed
   * @return {Array} Array of albums
   */
  static createAlbumsRows ({albumPlaying, library}) {
    const albumPlayingId = albumPlaying ? albumPlaying._id : null
    const needArtistDetails = library.filter !== null && library.artistSelected === null
    const sortedAlbums = _.sortBy(library.albums, ['artistID', 'year'])

    return sortedAlbums.map((album) => {
      const cover = album.cover ? `${COVER_FOLDER}/${album._id}.${album.cover}` : COVER_DEFAULT
      var cssClasses = null

      if (library.albumSelected === album) {
        cssClasses = albumPlayingId === album._id ? 'selected playing' : 'selected'
      }
      else if (albumPlayingId === album._id) {
        cssClasses = 'playing'
      }

      return (
        <li key={album._id} data-albumid={album._id} className={cssClasses}>
          <img src={cover} />
          <div>{album.year ? `${album.year} -` : ''} {album.title}</div>
          {needArtistDetails
            ? <div className="search-help">{library._artists[album.artistID - 1].name}</div>
            : null
          }
        </li>
      )
    })
  }

  constructor (props) {
    super(props)
    this.selectAlbum = this.selectAlbum.bind(this)
    this.playAlbum = this.playAlbum.bind(this)
    this.createMenu = this.createMenu.bind(this)
  }

  componentDidMount () {
    this.albumsDomNode = document.querySelector('.albums')
  }

  /**
   * When rendered, scroll the albums list to a given album if necessary
   */
  componentDidUpdate () {
    if (this.props.library.albumInSight) {
      Albums.jumpToAlbum(this.albumsDomNode, this.props.library.albumInSight)
    }
  }

  /**
   * When an album is doubleClicked, add its songs to playlist and start playing
   */
  playAlbum (event) {
    this.props.playAlbum(Albums.getAlbumId(event.target))
  }

  /**
   * When an album is clicked, pass its id to the whole library
   */
  selectAlbum (event) {
    this.props.library.setAlbumSelected(Albums.getAlbumId(event.target))
  }

  createMenu (event) {
    const albumID = Albums.getAlbumId(event.target)
    const actions = {
      addAlbumToPlaylist: this.props.addAlbumToPlaylist
    }
    libraryContextMenus.showAlbumMenu(albumID, actions)
    this.selectAlbum(event)
  }

  render () {
    return (
      <div className="albums">
        <ul tabIndex="3"
          onDoubleClick={this.playAlbum}
          onClick={this.selectAlbum}
          onContextMenu={this.createMenu}>
          {Albums.createAlbumsRows(this.props)}
        </ul>
      </div>
    )
  }
}

export default inject(({store}) => ({
  library: store.library,
  playAlbum: store.playAlbum,
  albumPlaying: store.albumPlaying,
  addAlbumToPlaylist: store.addAlbumToPlaylist
}))(observer(Albums))

Albums.propTypes = {
  library: PropTypes.shape({
    albums: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.number.isRequired,
      artistID: PropTypes.number,
      cover: PropTypes.string,
      title: PropTypes.string
    })).isRequired,
    artists: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired
    })).isRequired,
    albumSelected: PropTypes.shape({
      _id: PropTypes.number.isRequired
    }),
    setAlbumSelected: PropTypes.func.isRequired,
    artistSelected: PropTypes.shape({}),
    filter: PropTypes.instanceOf(RegExp),
    albumInSight: PropTypes.number
  }),

  albumPlaying: PropTypes.shape({
    _id: PropTypes.number.isRequired
  }),
  playAlbum: PropTypes.func.isRequired,
  addAlbumToPlaylist: PropTypes.func.isRequired
}
