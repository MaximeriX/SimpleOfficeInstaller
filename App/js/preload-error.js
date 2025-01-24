const { ipcRenderer, contextBridge } = require("electron")

const API = {
    window: {
        close: () => ipcRenderer.send("app/close"),
        minimize: () => ipcRenderer.send("app/minimize")
    }
}

console.log("Preload script loaded");
contextBridge.exposeInMainWorld("app", API);
contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
console.log("API exposed:", API);