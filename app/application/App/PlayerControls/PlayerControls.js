import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer, inject} from 'mobx-react'

import Play from './Play'
import Volume from './Volume'
import Previous from './Previous'
import Next from './Next'
import Shuffle from './Shuffle'
import Repeat from './Repeat'

export class PlayerControls extends Component {
  render () {
    const {player, playlist} = this.props
    return (
      <div className="player-controls">
        <Previous prevInPlaylist={player.prevInPlaylist}/>
        <Play isPlaying={player.isPlaying} playPause={player.playPause}/>
        <Next nextInPlaylist={player.nextInPlaylist}/>
        <Shuffle shufflePlaylist={playlist.shufflePlaylist}/>
        <Repeat repeat={player.repeat} toggleRepeat={player.toggleRepeat}/>
        <Volume intensity={player.volume} setVolume={player.setVolume}/>
      </div>
    )
  }
}

export default inject(({store}) => ({
  player: store.player,
  playlist: store.playlist
}))(observer(PlayerControls))

PlayerControls.propTypes = {
  player: PropTypes.shape({
    repeat: PropTypes.oneOf(['off', 'repeatOne', 'repeatAll']),
    isPlaying: PropTypes.bool.isRequired,
    volume: PropTypes.number.isRequired,
    prevInPlaylist: PropTypes.func.isRequired,
    nextInPlaylist: PropTypes.func.isRequired,
    playPause: PropTypes.func.isRequired,
    setVolume: PropTypes.func.isRequired,
    toggleRepeat: PropTypes.func.isRequired
  }).isRequired,
  playlist: PropTypes.shape({
    shufflePlaylist: PropTypes.func.isRequired
  })
}
