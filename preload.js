const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Dynamic click-through handling (ignore mouse when outside charm)
  setIgnoreMouseEvents: (ignore, forward) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, forward);
  },

  // State management
  getState: () => ipcRenderer.invoke('get-state'),
  saveState: (partial) => ipcRenderer.invoke('save-state', partial),

  // Charm events from Tray or Hotkeys
  onCharmChange: (callback) => {
    ipcRenderer.on('change-charm', (_event, charmId) => callback(charmId));
  },
  onCharmAction: (callback) => {
    ipcRenderer.on('charm-action', (_event, action, payload) => callback(action, payload));
  },
  onInitAnchor: (callback) => {
    ipcRenderer.on('init-anchor', (_event, anchorX) => callback(anchorX));
  },
  onCursorPos: (callback) => {
    ipcRenderer.on('cursor-pos', (_event, pos) => callback(pos));
  },

  quitApp: () => {
    ipcRenderer.send('quit-app');
  }
});

