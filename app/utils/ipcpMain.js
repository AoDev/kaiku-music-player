const electron = require('electron')
const {ipcMain} = electron

function on (channel, cb) {
  ipcMain.on(channel, (event, responseChannel, ...payload) => {
    function respond (...args) {
      event.sender.send(responseChannel, ...args)
    }
    const decoratedEvent = {
      originalEvent: event,
      respond,
    }
    cb(decoratedEvent, ...payload)
  })
}

module.exports = {
  on
}
