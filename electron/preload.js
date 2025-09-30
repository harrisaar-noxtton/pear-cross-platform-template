const { contextBridge } = require('electron');

// Expose a flag to detect desktop environment
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
});

// You can add more APIs here later if needed
// Example:
// contextBridge.exposeInMainWorld('fileAPI', {
//   openFile: () => ipcRenderer.invoke('dialog:openFile'),
// });
