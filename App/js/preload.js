const { ipcRenderer, contextBridge, shell, dialog } = require("electron");
const fs = require('fs');
const path = require('path');

const API = {
    window: {
        close: () => ipcRenderer.send("app/close"),
        minimize: () => ipcRenderer.send("app/minimize")
    }
};

contextBridge.exposeInMainWorld("app", API);
contextBridge.exposeInMainWorld('electron', {
    downloadOdtSetup: (filePath, url) => ipcRenderer.send('download-odt-setup', filePath, url),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback),
    onDownloadFailed: (callback) => ipcRenderer.on('download-failed', callback),
    downloadTeamsSetup: (filePath, url) => ipcRenderer.send('download-teams-setup', filePath, url),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', (event, filePath) => callback(filePath)),
    onDownloadFailed: (callback) => ipcRenderer.on('download-failed', (event, error) => callback(error)),
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    sendTranslations: (callback) => ipcRenderer.on('translations', callback),
    fs: {
        writeFile: (filePath, data) => fs.writeFileSync(filePath, data),
        mkdir: (dirPath) => fs.mkdirSync(dirPath, { recursive: true }),
        copyFile: (source, destination, callback) => {
            fs.copyFile(source, destination, callback);
        },
    },
    path: {
        join: (...args) => path.join(...args),
    },
    os: {
        tmpdir: () => require('os').tmpdir(),
    },
    dialog: {
        showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
        showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options)
    },
    updateLanguageUI: (callback) => ipcRenderer.on('translations', callback),
    openExternal: (url) => shell.openExternal(url)
});

console.log("Preload script loaded");
console.log("API exposed:", API);
