import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {observer} from 'mobx-react'
import utils from 'app-utils'

export class TimeControl extends Component {
  static formatTime (time) {
    const seconds = time.seconds < 10 ? '0' + time.seconds : time.seconds
    return `${time.minutes}:${seconds}`
  }

  constructor (props) {
    super(props)
    this.setPosition = this.setPosition.bind(this)
  }

  setPosition (event) {
    const {player} = this.props
    const element = event.currentTarget
    const width = element.offsetWidth
    const clickX = utils.getClickPosition(event).x
    const relativePosition = clickX / width
    player.sound.goToPosition(player.sound.duration * relativePosition)
  }

  render () {
    const {sound} = this.props.player
    let progressStyle = {width: 0}
    let time = '∞ / ∞'
    if (sound) {
      const {positionInMinSec, durationInMinSec} = sound
      progressStyle.width = sound.positionInPercent + '%'
      time = `${TimeControl.formatTime(positionInMinSec)} / ${TimeControl.formatTime(durationInMinSec)}`
    }

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
    sound: PropTypes.shape({
      duration: PropTypes.number.isRequired,
      positionInPercent: PropTypes.number.isRequired,
      positionInMinSec: PropTypes.shape({
      }).isRequired,
      durationInMinSec: PropTypes.shape({
      }).isRequired,
      goToPosition: PropTypes.func.isRequired,
    }),
  }).isRequired
}

export default observer(TimeControl)
