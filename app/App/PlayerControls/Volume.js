import PropTypes from 'prop-types'
import React, {Component} from 'react'
import utils from '../../utils'

const inactiveIcon = <svg xmlns="http://www.w3.org/2000/svg" width="138" height="48" viewBox="0 0 138 48"><path className="icon-path" d="M0 48h18v-6.1M72 22.9V48h18V16.6M24 39.8V48h18V33.5M48 31.4V48h18V25.1M96 14.5V48h18V8.2M138 0l-18 6.1V48h18"/></svg>
const activeIcon = <svg xmlns="http://www.w3.org/2000/svg" width="138" height="48" viewBox="0 0 138 48"><path className="icon-path" d="M0 48h18v-6.1M72 22.9V48h18V16.6M24 39.8V48h18V33.5M48 31.4V48h18V25.1M96 14.5V48h18V8.2M138 0l-18 6.1V48h18"/></svg>

export default class Volume extends Component {
  constructor (props) {
    super(props)
    this.setVolume = this.setVolume.bind(this)
  }

  setVolume (event) {
    var width = event.currentTarget.offsetWidth
    var clickX = utils.getClickPosition(event).x
    this.props.setVolume(clickX / width)
  }

  render () {
    const volumeStyle = {
      width: (this.props.intensity * 100) + '%'
    }
    return (
      <div className="volume unselectable" onClick={this.setVolume}>
        {inactiveIcon}
        <div className="mask" style={volumeStyle}>
          {activeIcon}
        </div>
      </div>
    )
  }
}

Volume.propTypes = {
  intensity: PropTypes.number.isRequired,
  setVolume: PropTypes.func.isRequired
}
