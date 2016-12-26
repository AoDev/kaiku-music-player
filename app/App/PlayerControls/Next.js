import React, {PropTypes} from 'react'

const nextIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M4.1 32c.5 0 1.2.1 1.7-.3l14.3-12.1v9.6c0 1.5 1.2 2.8 2.8 2.8h4.2c1.5 0 2.8-1.2 2.8-2.8V2.8c0-1.5-1.2-2.8-2.8-2.8H23c-1.5 0-2.8 1.2-2.8 2.8v9.7L5.8.4C5.3 0 4.6.1 4.1.1c-2 0-2 1.8-2 2.3v27.4c0 .3 0 2.2 2 2.2z"/></svg>

export default function Next ({nextInPlaylist}) {
  return (
    <span className="next unselectable" onClick={nextInPlaylist}>
      {nextIcon}
    </span>
  )
}

Next.propTypes = {
  nextInPlaylist: PropTypes.func.isRequired
}
