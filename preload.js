const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveConfig: (config) => ipcRenderer.send('save-config', config),
    getLocalIp: () => ipcRenderer.invoke('get-local-ip')
});

