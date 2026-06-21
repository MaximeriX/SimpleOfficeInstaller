const { contextBridge, ipcRenderer } = require('electron');

const bootstrapPromise = ipcRenderer.invoke('app:bootstrap');

contextBridge.exposeInMainWorld('soi', {
  window: {
    close: () => ipcRenderer.invoke('window:close'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    setBackgroundColor: (color) => ipcRenderer.invoke('window:setBackgroundColor', color)
  },
  locale: {
    getInitial: () => bootstrapPromise.then((payload) => payload.locale)
  },
  installer: {
    start: (payload) => ipcRenderer.invoke('installer:start', payload),
    importXmlAndStart: () => ipcRenderer.invoke('installer:importXmlAndStart')
  },
  config: {
    exportXml: (xml) => ipcRenderer.invoke('config:exportXml', xml)
  },
  app: {
    bootstrap: () => bootstrapPromise,
    getInfo: () => bootstrapPromise.then((payload) => payload.app)
  },
  links: {
    open: (url) => ipcRenderer.invoke('links:open', url)
  },
  progress: {
    cancel: (operationId) => ipcRenderer.invoke('progress:cancel', operationId),
    dismiss: () => ipcRenderer.invoke('progress:dismiss'),
    onUpdate: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('progress:update', listener);
      return () => {
        ipcRenderer.removeListener('progress:update', listener);
      };
    }
  }
});
