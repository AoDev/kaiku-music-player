import PropTypes from 'prop-types'
import React, {Component} from 'react'

export default class Box extends Component {
  render () {
    const {hidden, visible, fullHeight} = this.props
    const style = {}
    var className = null

    if (hidden || visible === false) {
      className = 'hidden'
    }

    if (fullHeight) {
      style.height = '100%'
    }

    return (
      <div className={className} style={style}>
        {this.props.children}
      </div>
    )
  }
}

Box.propTypes = {
  hidden: PropTypes.bool,
  visible: PropTypes.bool,
  fullHeight: PropTypes.bool,
  children: PropTypes.node
}

Box.defaultProps = {
  fullHeight: false
}
