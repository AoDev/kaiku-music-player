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
    const {player} = this.props
    return (
      <div className="player-controls">
        <Previous playPrevious={player.playPrevious}/>
        <Play isPlaying={player.isPlaying} playPause={player.playPause}/>
        <Next nextInPlaylist={player.playNext}/>
        <Shuffle shufflePlaylist={player.shuffle}/>
        <Repeat repeat={player.playlist.repeatMode} toggleRepeat={player.playlist.toggleRepeat}/>
        <Volume intensity={player.volume} setVolume={player.setVolume}/>
      </div>
    )
  }
}

export default inject(({appStore}) => ({
  player: appStore.player,
}))(observer(PlayerControls))

PlayerControls.propTypes = {
  player: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    volume: PropTypes.number.isRequired,
    playPrevious: PropTypes.func.isRequired,
    playNext: PropTypes.func.isRequired,
    playPause: PropTypes.func.isRequired,
    setVolume: PropTypes.func.isRequired,
    shuffle: PropTypes.func.isRequired,
    playlist: PropTypes.shape({
      repeatMode: PropTypes.oneOf(['off', 'repeatOne', 'repeatAll']).isRequired,
      toggleRepeat: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}
