import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer, inject} from 'mobx-react'
import libraryContextMenus from './libraryContextMenus'

const compareArtistName = new Intl.Collator('en', {sensitivity: 'base'}).compare

// const K_DOWN = 40
const K_ENTER = 13
// const K_ESCAPE = 27
// const K_P = 80
// const K_TAB = 9
// const K_UP = 38

export class Artists extends Component {
  /**
   * Scroll the artists list to a given artist so that's it's in sight
   * @param  {DOM element} artistsDomNode
   * @param  {Number} artistId
   */
  static jumpToArtist (artistsDomNode, artistId) {
    const nodes = artistsDomNode.querySelectorAll('[data-artistid="' + artistId + '"]')
    if (nodes.length) {
      artistsDomNode.scrollTop = nodes[0].offsetTop - artistsDomNode.offsetTop
    }
  }

  /**
   * Generate the list of artists to be displayed
   * @return {Array(li)}
   */
  static createArtistsRows ({library, artistPlaying}) {
    const artistPlayingId = artistPlaying ? artistPlaying._id : null
    const sortedArtists = library.artists.concat().sort((artist1, artist2) => {
      return compareArtistName(artist1.name, artist2.name)
    })

    return sortedArtists.map((artist) => {
      var cssClasses = null
      if (library.artistSelected === artist) {
        cssClasses = artistPlayingId === artist._id ? 'selected playing' : 'selected'
      }
      else if (artistPlayingId === artist._id) {
        cssClasses = 'playing'
      }

      return (
        <li key={artist._id} data-artistid={artist._id} className={cssClasses}>
          {artist.name}
        </li>
      )
    })
  }

  constructor (props) {
    super(props)
    this.selectArtist = this.selectArtist.bind(this)
    this.playArtist = this.playArtist.bind(this)
    this.createMenu = this.createMenu.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  componentDidMount () {
    this.artistsDomNode = document.querySelector('.artists')
  }

  /**
   * When rendered, scroll the artists list to a given artist if necessary
   */
  componentDidUpdate () {
    if (this.props.library.artistInSight) {
      Artists.jumpToArtist(this.artistsDomNode, this.props.library.artistInSight)
    }
  }

  /**
   * When an artist is doubleClicked, add its songs to playlist and start playing
   * @param  {DOM event} event
   */
  playArtist (event) {
    const artistID = parseInt(event.target.dataset.artistid, 10)
    this.props.playArtist(artistID)
  }

  /**
   * When an artist is clicked, pass its id to the whole library
   * @param  {DOM event} event
   */
  selectArtist (event) {
    const artistID = parseInt(event.target.dataset.artistid, 10)
    this.props.library.setArtistSelected(artistID)
  }

  createMenu (event) {
    const artistID = parseInt(event.target.dataset.artistid, 10)
    const actions = {
      addArtistToPlaylist: this.props.addArtistToPlaylist
    }
    libraryContextMenus.showArtistMenu(artistID, actions)
  }

  onKeyDown (event) {
    const {keyCode, shiftKey} = event
    const {artistSelected} = this.props.library
    if (keyCode === K_ENTER && artistSelected) {
      if (shiftKey) {
        this.props.addArtistToPlaylist(artistSelected._id)
      }
      else {
        this.props.playArtist(artistSelected._id)
      }
    }
  }

  onFocus () {
    window.document.addEventListener('keydown', this.onKeyDown)
  }

  onBlur () {
    window.document.removeEventListener('keydown', this.onKeyDown)
  }

  render () {
    return (
      <div className="artists">
        <ul tabIndex="2"
          onClick={this.selectArtist}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onDoubleClick={this.playArtist}
          onContextMenu={this.createMenu}>
          {Artists.createArtistsRows(this.props)}
        </ul>
      </div>
    )
  }
}

export default inject(({store}) => ({
  library: store.library,
  playArtist: store.playArtist,
  artistPlaying: store.artistPlaying,
  addArtistToPlaylist: store.addArtistToPlaylist
}))(observer(Artists))

Artists.propTypes = {
  library: PropTypes.shape({
    /**
     * ID of artist to which the list should scroll once updated.
     */
    artistInSight: PropTypes.number,
    artists: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    artistSelected: PropTypes.shape({
      _id: PropTypes.number.isRequired
    }),
    artistPlaying: PropTypes.shape({
      _id: PropTypes.isRequired
    }),
    setArtistSelected: PropTypes.func.isRequired
  }).isRequired,
  playArtist: PropTypes.func.isRequired,
  addArtistToPlaylist: PropTypes.func.isRequired
}
