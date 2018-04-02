import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer} from 'mobx-react'
import utils from 'app-utils'

@observer
export default class TimeControl extends Component {
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

  constructor (props) {
    super(props)
    this.setPosition = this.setPosition.bind(this)
  }

  setPosition (event) {
    const element = event.currentTarget
    const width = element.offsetWidth
    const clickX = utils.getClickPosition(event).x
    const relativePosition = clickX / width
    this.props.player.goToSongPosition(relativePosition)
  }

  render () {
    const {position, duration} = this.props.player
    const progressStyle = {width: utils.percentage(position, duration, 6) + '%'}
    const time = `${TimeControl.convertTime(position)} / ${TimeControl.convertTime(duration)}`

    return (
      <div className="timeline">
        <div className="timeline-label">{time}</div>
        <div className="timeline-control" onClick={this.setPosition}>
          <div className="timeline-duration"/>
          <div className="timeline-progress" style={progressStyle}/>
        </div>
      </div>
    )
  }
}

TimeControl.propTypes = {
  player: PropTypes.shape({
    position: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    goToSongPosition: PropTypes.func.isRequired
  }).isRequired
}

TimeControl.defaultProps = {
  // These are set because sometimes it happens that the player lib emits
  // unvalid values or the store is kind of in an unstable state.
  // Needs more investigation but in the meantime, keep this default.
  player: {
    position: 0,
    duration: 0
  }
}
