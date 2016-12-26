import React, {PropTypes} from 'react'

const previousIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M27.9 0c-.5 0-1.2-.1-1.7.3L11.8 12.4V2.8C11.8 1.2 10.6 0 9 0H4.9C3.3 0 2.1 1.2 2.1 2.8v26.4c0 1.5 1.2 2.8 2.8 2.8H9c1.5 0 2.8-1.2 2.8-2.8v-9.7l14.3 12.1c.5.4 1.2.3 1.7.3 2 0 2-1.8 2-2.3V2.3c.1-.4.1-2.3-1.9-2.3z"/></svg>

export default function Previous ({prevInPlaylist}) {
  return (
    <span className="previous unselectable" onClick={prevInPlaylist}>
      {previousIcon}
    </span>
  )
}

Previous.propTypes = {
  prevInPlaylist: PropTypes.func.isRequired
}
