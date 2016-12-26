import React, {PropTypes} from 'react'

export default function SongsFolders (props) {
  return (
    <div className="space-bottom-2">
      <h3>Songs directories</h3>
      <p>Search for songs in your computer by selecting folders.</p>

      {props.songsFolders.map((folder) => (
        <div key={folder} className="space-bottom-1 input-group">
          <input type="text" placeholder="Songs directory" value={folder} readOnly/>
          <span className="input-add-on">
            <button data-folder={folder} onClick={props.removeSongsFolder}>
              Remove
            </button>
          </span>
        </div>
      ))}

      <button onClick={props.showSelectFolderDialog}>Add a folder</button>
    </div>
  )
}

SongsFolders.propTypes = {
  songsFolders: PropTypes.arrayOf(PropTypes.string),
  removeSongsFolder: PropTypes.func.isRequired,
  showSelectFolderDialog: PropTypes.func.isRequired
}
