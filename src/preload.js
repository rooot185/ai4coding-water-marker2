const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to Main: one-way
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  // Renderer to Main and back: two-way
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },
  // Main to Renderer
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
