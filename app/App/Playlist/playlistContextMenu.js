import {remote} from 'electron'
const {Menu} = remote
const currentWindow = remote.getCurrentWindow()

function showPlaylistMenu (songID, actions) {
  Menu.buildFromTemplate([
    {
      label: 'Remove from playlist',
      click () {
        actions.removeFromPlaylist([songID])
      }
    }
  ]).popup(currentWindow, {async: true})
}

export default {
  showPlaylistMenu
}
