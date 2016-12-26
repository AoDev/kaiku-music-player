import React, {PropTypes} from 'react'

const shuffleIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M21 10.5h3v3.7c0 .3.4.6.7.4.7-.5 5.6-5.1 7.1-6.7.3-.3.3-.7 0-1-1.4-1.4-5.6-5.6-7.2-6.9-.2-.2-.6 0-.6.3V4h-6L8 21.4H0v6.7h10.9L21 10.5z"/><path className="icon-path" d="M11.7 9.1L8 4H0v6.7h4.6l3.3 4.5M24 21.6h-3.1l-1.7-2.4-3.6 6.4 1.8 2.4H24v3.5c0 .5.6.8 1 .4l6.7-6.5c.4-.4.4-1.1 0-1.5l-6.9-6.2c-.3-.3-.8-.1-.8.4v3.5z"/></svg>

export default function Shuffle ({shufflePlaylist}) {
  return (
    <span className="shuffle unselectable" onClick={shufflePlaylist}>
      {shuffleIcon}
    </span>
  )
}

Shuffle.propTypes = {
  shufflePlaylist: PropTypes.func.isRequired
}
