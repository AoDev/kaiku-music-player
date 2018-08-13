import {remote} from 'electron'
const {Menu} = remote
const currentWindow = remote.getCurrentWindow()

function showPlaylistMenu (actions) {
  Menu.buildFromTemplate([
    {
      label: 'Remove from playlist',
      click () {
        actions.removeFromPlaylist()
      }
    }
  ]).popup(currentWindow, {async: true})
}

export default {
  showPlaylistMenu
}
