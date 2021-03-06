'use strict';

import { BrowserWindow, app } from 'electron';

import { initSkeinBackendServer } from '../server/skein-server';
import { ElectronSkeinServer } from './electron-server';
import { centerAndResetToInitial, INITIAL_SIZE, BASE_WINDOW_TITLE } from './util/window';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: BASE_WINDOW_TITLE,
        width: INITIAL_SIZE.x,
        height: INITIAL_SIZE.y,
        icon: __dirname + '/../assets/images/icon.png',
        webPreferences: {
            nodeIntegration: false,
            preload: './preload.js'
        }
    });
    centerAndResetToInitial(mainWindow);

    // start the server to communicate with skein
    const skeinServer = initSkeinBackendServer(new ElectronSkeinServer(mainWindow));
    skeinServer.startServer();

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    const loadSkeinURL = () => mainWindow.loadURL('http://localhost:4200');
    loadSkeinURL();
    mainWindow.webContents.on('did-fail-load', () => {
        setTimeout(() => loadSkeinURL(), 250);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        skeinServer.killServer();

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
