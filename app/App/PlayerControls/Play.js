import PropTypes from 'prop-types'
import React from 'react'

const playIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M29.3 14.7L4.3.2C3.3-.4 2 .4 2 1.5v28.9c0 1.2 1.3 1.9 2.3 1.3l25-14.4c1-.6 1-2.1 0-2.6z"/></svg>
const pauseIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M11.1 0H4.9C3.6 0 2.5 1.1 2.5 2.5v27.1c0 1.4 1.1 2.5 2.5 2.5h6.2c1.4 0 2.5-1.1 2.5-2.5V2.5C13.5 1.1 12.4 0 11.1 0zm16 0h-6.2c-1.4 0-2.5 1.1-2.5 2.5v27.1c0 1.4 1.1 2.5 2.5 2.5h6.2c1.4 0 2.5-1.1 2.5-2.5V2.5C29.5 1.1 28.4 0 27.1 0z"/></svg>

/**
 * Play / pause button
 */
export default function Play ({playPause, isPlaying}) {
  const cssClasses = isPlaying ? 'play unselectable' : 'play paused unselectable'

  return (
    <span className={cssClasses} onClick={playPause}>
      {isPlaying ? pauseIcon : playIcon}
    </span>
  )
}

Play.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  playPause: PropTypes.func.isRequired
}
