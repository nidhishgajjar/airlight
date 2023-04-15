const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
    invoke: (channel, data) => {
      return ipcRenderer.invoke(channel, data);
    },
  },
});

// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//   ipcRenderer: {
//     send: (channel, data) => {
//       ipcRenderer.send(channel, data);
//     },
//     on: (channel, callback) => {
//       ipcRenderer.on(channel, (event, ...args) => callback(...args));
//     },
//     removeListener: (channel, callback) => {
//       ipcRenderer.removeListener(channel, callback);
//     },
//     invoke: (channel, data) => {
//       return ipcRenderer.invoke(channel, data);
//     },
//   },
// });
