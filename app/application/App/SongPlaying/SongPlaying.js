import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer, inject} from 'mobx-react'
import TimeControl from './TimeControl'
import utils from 'app-utils'

export class SongPlaying extends Component {
  render () {
    const {store} = this.props
    const {songPlaying, albumPlaying, artistPlaying} = store

    return (
      <div className="song-playing">
        <img width="88" height="88" className="clickable"
          src={utils.getAlbumCover(albumPlaying)}
          onClick={store.focusPlayingSongInLibrary}/>
        <div>
          <TimeControl player={store.player}/>

          {songPlaying &&
            <div>
              <div className="title">{songPlaying.title}</div>
              <small>by </small> <span className="artist">{artistPlaying.name}</span>
              <small> on </small> <span className="album">{albumPlaying.title}</span>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default inject(({store}) => ({
  store: store
}))(observer(SongPlaying))

SongPlaying.propTypes = {
  store: PropTypes.shape({
    songPlaying: PropTypes.shape({
      title: PropTypes.string.isRequired,
      trackNr: PropTypes.number.isRequired
    }),
    albumPlaying: PropTypes.shape({
      title: PropTypes.string.isRequired
    }),
    artistPlaying: PropTypes.shape({
      name: PropTypes.string.isRequired
    }),
    player: PropTypes.shape({
      duration: PropTypes.number.isRequired,
      position: PropTypes.number.isRequired
    }),
    focusPlayingSongInLibrary: PropTypes.func.isRequired
  })
}
