import PropTypes from 'prop-types'
import React from 'react'

const repeatOneIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M14.2 12.7L22 7.8c1.1-.7 1.1-1.9 0-2.6l-7.9-5C13-.5 12 0 12 1.4v10c.1 1.5 1.1 2 2.2 1.3z"/><path fill="none" d="M0 32L32 0"/><path className="icon-path" d="M31.3 30.1h-2.9c-.4 0-.7-.3-.7-.7v-14c0-.6-.6-.9-1.1-.5-1.1.8-2.2 1.5-3.5 2-.4.2-.9-.2-.9-.6v-2.4c0-.3.2-.5.4-.6 1-.4 2.1-1 3.2-1.9 1.2-.9 2-2 2.5-3.1.1-.3.3-.4.6-.4h2.3c.5-.2.8.1.8.5v21c0 .4-.3.7-.7.7z"/><path className="icon-path" d="M14.9 32C6.7 32 0 25.7 0 18S6.7 4 14.9 4c1.1 0 2 .9 2 2s-.9 2-2 2C8.9 8.1 4 12.5 4 18s4.9 10 10.9 10c2.2 0 4.3-.6 6.1-1.7.9-.6 2.2-.3 2.8.6.6.9.3 2.2-.6 2.8-2.5 1.5-5.4 2.3-8.3 2.3z"/></svg>
const repeatAllIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path className="icon-path" d="M14.2 12.7L22 7.8c1.1-.7 1.1-1.9 0-2.6l-7.9-5C13-.5 12 0 12 1.4v10c.1 1.5 1.1 2 2.2 1.3zM17.9 19.3L10 24.2c-1.1.7-1.2 1.9 0 2.6l8 5c1.1.7 2.1.2 2.1-1.2v-10c-.1-1.5-1.1-2-2.2-1.3z"/><path fill="none" d="M0 32L32 0"/><path className="icon-path" d="M6 25.3c-.4 0-.8-.1-1.2-.4C1.7 22.6 0 19.5 0 16.2 0 9.5 7.2 4 16 4c1.1 0 2 .9 2 2s-.9 2-2 2C9.5 8 4 11.7 4 16.2c0 2 1.1 4 3.2 5.5.9.7 1.1 1.9.4 2.8-.4.5-1 .8-1.6.8zM16 28.3c-1.1 0-2-.9-2-2s.9-2 2-2c6.5 0 12-3.7 12-8.2 0-2-1.1-4-3.2-5.5-.9-.7-1.1-1.9-.4-2.8.7-.9 1.9-1.1 2.8-.4 3.1 2.3 4.9 5.4 4.9 8.7-.1 6.8-7.3 12.2-16.1 12.2z"/></svg>

export default function Repeat ({repeat, toggleRepeat}) {
  const isActive = repeat === 'repeatAll' || repeat === 'repeatOne'
  var cssClasses = isActive ? 'control-active' : ''
  cssClasses += ' repeat unselectable'

  return (
    <span className={cssClasses} onClick={toggleRepeat}>
      {repeat === 'repeatOne' ? repeatOneIcon : repeatAllIcon}
    </span>
  )
}

Repeat.propTypes = {
  toggleRepeat: PropTypes.func.isRequired,
  repeat: PropTypes.oneOf(['repeatOne', 'repeatAll', 'off'])
}
