'use strict';

import { BrowserWindow, app } from 'electron';

import { initSpoolBackendServer } from '../server/spool-server';
import { ElectronSpoolServer } from './electron-server';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        title: 'Spool',
        height: 600,
        icon: __dirname + '/../assets/images/icon.png',
        webPreferences: {
            nodeIntegration: false,
            preload: './preload.js'
        }
    });

    // start the server to communicate with spool
    const spoolServer = initSpoolBackendServer(new ElectronSpoolServer(mainWindow));
    spoolServer.startServer();

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    const loadSpoolURL = () => mainWindow.loadURL('http://localhost:4200');
    loadSpoolURL();
    mainWindow.webContents.on('did-fail-load', () => {
        setTimeout(() => loadSpoolURL(), 250);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        spoolServer.killServer();

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});