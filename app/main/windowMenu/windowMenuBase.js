const {shell} = require('electron')

const edit = {
  label: 'Edit',
  submenu: [
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {role: 'pasteandmatchstyle'},
    {role: 'delete'},
    {role: 'selectall'}
  ]
}

const view = {
  label: 'View',
  submenu: [
    {role: 'reload'},
    {type: 'separator'},
    {role: 'resetzoom'},
    {role: 'zoomin'},
    {role: 'zoomout'},
    {type: 'separator'},
    {role: 'togglefullscreen'}
  ]
}

if (process.env.NODE_ENV === 'development') {
  view.submenu = view.submenu.concat(
    {type: 'separator'},
    {role: 'forcereload'},
    {role: 'toggledevtools'},
  )
}

const window = {
  role: 'window',
  submenu: [
    {role: 'minimize'},
    {role: 'close'}
  ]
}

const help = {
  role: 'help',
  submenu: [
    {
      label: 'About Kaiku',
      click () {
        shell.openExternal('https://github.com/AoDev/kaiku-music-player/blob/master/README.md')
      }
    },
  ]
}

const baseTemplate = [
  edit,
  view,
  window,
  help,
]

module.exports = {
  baseTemplate,
}
