import PropTypes from 'prop-types'
import React from 'react'
const {shell} = require('electron')

export default class ExternalLink extends React.Component {
  constructor (props) {
    super(props)
    this.openLink = this.openLink.bind(this)
  }

  openLink (event) {
    event.preventDefault()
    shell.openExternal(event.currentTarget.href)
    if (this.props.onClick) {
      this.props.onClick(event)
    }
  }

  render () {
    const {href, children, onClick, ...otherProps} = this.props
    return (
      <a href={href} onClick={this.openLink} {...otherProps}>
        {children}
      </a>
    )
  }
}

ExternalLink.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
}
