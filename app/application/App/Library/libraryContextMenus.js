import {remote} from 'electron'
const {Menu} = remote
const currentWindow = remote.getCurrentWindow()

function showArtistMenu (artistID, actions) {
  Menu.buildFromTemplate([
    {
      label: 'Add to playlist',
      click () {
        actions.addArtistToPlaylist(artistID)
      }
    }
    // {
    //   label: 'Refresh data',
    //   click () {
    //     // mainWindow.webContents.send('refreshArtist', {artistID})
    //   }
    // },
    // {
    //   label: 'Online info',
    //   click () {
    //     // mainWindow.webContents.send('fetchArtistOnline', {artistID})
    //   }
    // },
    // {
    //   type: 'separator'
    // }
  ]).popup(currentWindow, {async: true})
}

function showAlbumMenu (albumID, actions) {
  Menu.buildFromTemplate([
    {
      label: 'Add to playlist',
      click () {
        actions.addAlbumToPlaylist(albumID)
      }
    },
    {
      label: 'Refresh album data',
      click () {
        actions.refreshAlbumData(albumID)
      }
    },
  ]).popup(currentWindow, {async: true})
}

function showSongMenu (songID, actions) {
  Menu.buildFromTemplate([
    {
      label: 'Add to playlist',
      click () {
        actions.addSongToPlaylist(songID)
      }
    }
    // {
    //   label: 'Refresh data',
    //   click () {
    //     actions.refreshSongData(songID)
    //     // mainWindow.webContents.send('refreshArtist', {songID})
    //   }
    // },
    // {
    //   label: 'Online info',
    //   click () {
    //     // mainWindow.webContents.send('fetchArtistOnline', {songID})
    //   }
    // },
    // {
    //   type: 'separator'
    // }
  ]).popup(currentWindow, {async: true})
}

export default {
  showAlbumMenu,
  showArtistMenu,
  showSongMenu
}
