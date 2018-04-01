const electron = require('electron')
const {ipcRenderer} = electron

function sendMain (channel, ...payload) {
  const responseChannel = String(Math.random())
  const promise = new Promise((resolve) => {
    ipcRenderer.once(responseChannel, (event, result) => {
      resolve(result)
    })
  })
  ipcRenderer.send(channel, responseChannel, ...payload)
  return promise
}

module.exports = {
  sendMain
}
