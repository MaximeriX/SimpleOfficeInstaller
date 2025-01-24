const { app, BrowserWindow, ipcMain } = require('electron');
const os = require("os");
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

let mainWindow;

function isAdmin() {
    return new Promise((resolve, reject) => {
        if (os.platform() === 'win32') {
            exec('net session', (error) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(true);
        }
    });
}

async function createWindow() {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
        app.quit();
        return;
    }

    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, 'images/icon.ico'),
        width: 530,
        height: 657,
        minWidth: 530,
        minHeight: 657,
        autoHideMenuBar: true,
        frame: false,
        backgroundColor: 'white',
        resizable: true,
        fullscreenable: false,
        webPreferences: {
            preload: path.join(__dirname, 'js/preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('index.html');
}

function showErrorAndQuit() {
    const errorWindow = new BrowserWindow({
        icon: path.join(__dirname, 'images/icon.ico'),
        width: 400,
        height: 200,
        minWidth: 400,
        minHeight: 200,
        autoHideMenuBar: true,
        frame: false,
        backgroundColor: 'white',
        resizable: true,
        fullscreenable: false,
        webPreferences: {
            preload: path.join(__dirname, 'js/preload-error.js'),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    errorWindow.loadFile(path.join(__dirname, 'error.html'));

    errorWindow.on('closed', () => {
        app.quit();
    });
}

ipcMain.on('download-odt-setup', (event, filePath, urlODT) => {
    const file = fs.createWriteStream(filePath);
    https.get(urlODT, (response) => {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                event.reply('download-complete', filePath);
                startOdtSetup(filePath);
            });
        } else {
            console.error('Download failed with status code:', response.statusCode);
            event.reply('download-failed', response.statusCode);
        }
    }).on('error', (err) => {
        console.error('Error downloading the file:', err.message);
        event.reply('download-failed', err.message);
    });
});

function startOdtSetup(filePath) {
    const child = exec(`"${filePath}" /extract:%temp%\\OfficeSetupFiles /passive /norestart /quiet`, (error) => {
        if (error) {
            console.error(`Error executing setup: ${error.message}`);
            return;
        }
    });

    child.on('exit', (code) => {
        console.log(`Setup exited with code: ${code}`);
        cleanupFiles(filePath);
    });
}

function cleanupFiles(filePath) {
    const configFilePath = path.join(path.dirname(filePath), 'configuration-Office365-x64.xml');
    const odtFilePath = filePath;
    
    if (fs.existsSync(configFilePath)) {
        fs.unlink(configFilePath, (err) => {
            if (err) {
                console.error(`Error deleting configuration file: ${err.message}`);
            } else {
                console.log('Deleted configuration-Office365-x64.xml');
            }
        });
    }

    fs.unlink(odtFilePath, (err) => {
        if (err) {
            console.error(`Error deleting officedeploymenttool.exe: ${err.message}`);
        } else {
            console.log('Deleted officedeploymenttool.exe');
        }
    });

    setTimeout(() => {
        exec(`%temp%\\OfficeSetupFiles\\setup.exe /configure %temp%\\OfficeSetupFiles\\config.xml`, (error) => {
            if (error) {
                console.error(`Error executing setup.exe: ${error.message}`);
                return;
            }
            console.log('Started setup.exe with config.xml');
        });
    }, 3000);
}

ipcMain.on('download-teams-setup', (event, filePath, url) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                event.reply('download-complete', filePath);
                startTeamsSetup(filePath);
            });
        } else {
            console.error('Download failed with status code:', response.statusCode);
            event.reply('download-failed', response.statusCode);
        }
    }).on('error', (err) => {
        fs.unlink(filePath);
        console.error('Error downloading the file:', err.message);
        event.reply('download-failed', err.message);
    });
});

function startTeamsSetup(filePath) {
    const installerName = 'MSTeamsSetup.exe';
    const processName = 'ms-teams.exe';
    let hasKilledTeams = false;

    exec(`taskkill /F /IM ${processName}`, (err) => {
        if (err) {
            console.error(`Error killing ${processName}: ${err.message}`);
        } else {
            console.log(`${processName} has been killed (if it was running).`);
        }

        setTimeout(() => {
            const child = exec(`"${filePath}"`, (error) => {
                if (error) {
                    console.error(`Error executing Teams setup: ${error.message}`);
                    return;
                }
            });
            setTimeout(() => {
                isProcessRunning(installerName, (running) => {
                    if (running) {
                        console.log(`${installerName} is running. Waiting for it to close...`);
                        const checkInterval = setInterval(() => {
                            isProcessRunning(installerName, (stillRunning) => {
                                if (!stillRunning) {
                                    clearInterval(checkInterval);
                                    console.log(`${installerName} has closed. Deleting installer...`);
                                    fs.unlink(filePath, (err) => {
                                        if (err) {
                                            console.error(`Error deleting ${filePath}: ${err.message}`);
                                        } else {
                                            console.log(`${filePath} deleted successfully.`);
                                        }
                                        const checkTeamsInterval = setInterval(() => {
                                            isProcessRunning(processName, (teamsRunning) => {
                                                if (teamsRunning && !hasKilledTeams) {
                                                    console.log(`${processName} is running. Killing the process...`);
                                                    exec(`taskkill /F /IM ${processName}`, (err) => {
                                                        if (err) {
                                                            console.error(`Error killing ${processName}: ${err.message}`);
                                                        } else {
                                                            console.log(`${processName} has been killed.`);
                                                            hasKilledTeams = true;
                                                        }
                                                    });
                                                }
                                            });
                                        }, 3000);
                                    });
                                }
                            });
                        }, 1000);
                    } else {
                        console.log(`${installerName} is not running.`);
                    }
                });
            }, 2000);
        }, 1500);
    });
}

function isProcessRunning(processName, callback) {
    exec(`tasklist`, (err, stdout) => {
        if (err) {
            console.error(`Error checking for process: ${err.message}`);
            return callback(false);
        }
        const isRunning = stdout.toLowerCase().includes(processName.toLowerCase());
        callback(isRunning);
    });
}

function waitForProcessToClose(processName, callback) {
    const checkInterval = 1000;

    const interval = setInterval(() => {
        isProcessRunning(processName, (running) => {
            if (!running) {
                clearInterval(interval);
                callback();
            }
        });
    }, checkInterval);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(async () => {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
        showErrorAndQuit();
    } else {
        createWindow();
    }
});

ipcMain.on("app/close", () => {
    app.quit();
});

ipcMain.on("app/minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.minimize();
});

ipcMain.on('start-installation', (event, formData) => {
    if (validateForm(formData)) {
        console.log('Form is valid. Proceeding with installation...');
    } else {
        console.error('Form validation failed.');
        event.reply('installation-failed', 'Form validation failed.');
    }
});

function validateForm(formData) {
    return true;
}