import React, {PropTypes} from 'react'

export default function FindSongs (props) {
  return (
    <div className="text-center">
      <h1>Your library is empty!</h1>
      <button className="btn-default" onClick={props.showSettings}>
        Start looking for songs
      </button>
    </div>
  )
}

FindSongs.propTypes = {
  showSettings: PropTypes.func.isRequired
}
