import {observer, inject} from 'mobx-react'
import React, {Component, PropTypes} from 'react'
import PlayerControls from './PlayerControls'
import SongPlaying from './SongPlaying'
import FindSongs from './FindSongs'
import Library from './Library'
import Playlist from './Playlist'
import Settings from './Settings'
import SearchBar from './SearchBar'
import {Box} from 'UI'

export class App extends Component {
  componentDidMount () {
    this.props.store.library.loadLibraryFromDb()
  }

  render () {
    const {store} = this.props
    const {library} = store

    return (
      <div className="kaiku">
        <div className="main-header">
          <SongPlaying/>
          <SearchBar
            setSearchFilter={library.setSearchFilter}/>
          <PlayerControls/>
        </div>

        <div className="main-content">
        {library.isEmpty
          ? <div className="panel shadow-bottom">
              <FindSongs showSettings={store.settings.show}/>
            </div>

          : <div>
              <Library/>
              <Playlist/>
            </div>
        }
        </div>

        <Box visible={store.settings.visible}>
          <Settings/>
        </Box>
      </div>
    )
  }
}

export default inject(({store}) => ({
  store: store
}))(observer(App))

App.propTypes = {
  store: PropTypes.shape({
    playlist: PropTypes.object,
    player: PropTypes.object,
    settings: PropTypes.shape({
      songsFolder: PropTypes.string,
      visible: PropTypes.bool.isRequired
    }).isRequired,
    library: PropTypes.shape({
      isLoaded: PropTypes.bool.isRequired,
      isEmpty: PropTypes.bool.isRequired,
      loadLibraryFromDb: PropTypes.func.isRequired
    }).isRequired,
    focusPlayingSongInLibrary: PropTypes.func.isRequired
  }).isRequired
}
