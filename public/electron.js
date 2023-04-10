const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeTheme } = require('electron');
const path = require('path');
let mainWindow;
let tray;


function createWindow() {

  mainWindow = new BrowserWindow({
    width: 750,
    maxWidth: 750,
    minWidth: 500,
    height: 48,
    minHeight: 48,
    frame: false,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#FFFFFF',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      webviewTag: true,
      // preload: path.join(__dirname, '../build/preload.js'),
      preload: path.join(__dirname, '../public/preload.js'),
    },
    x: 30,
    y: 50,
  });

  // mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.setOpacity(0.95);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  ipcMain.on('quickSearchRequested', (event, onRequest) => {
    const newHeight = onRequest ? 900 : 48;
    const currentWidth = mainWindow.getBounds().width;
    mainWindow.setSize(currentWidth, newHeight, true);
  });

  ipcMain.on('showLangInterface', (event, interfaceVisible) => {
    if (interfaceVisible) {
      newHeight = 900;
    const currentWidth = mainWindow.getBounds().width;
    mainWindow.setSize(currentWidth, newHeight, true);
    }
  });

  ipcMain.on('textarea-height-changed', (event, newHeight) => {
    const updatedWindowHeight = newHeight;

    mainWindow.setSize(mainWindow.getBounds().width, updatedWindowHeight, true);
  });

  trayIcon = path.join(__dirname, '../build/link.png');
  // trayIcon = nativeTheme.shouldUseDarkColors ? path.join(__dirname, '../build/link-white.png') : path.join(__dirname, '../build/link.png');
  trayIcon = path.join(__dirname, 'link.png');
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Chad',
      click: () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Electron React Menu Bar App');
  tray.setContextMenu(contextMenu);

  globalShortcut.register('Alt+Space', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  globalShortcut.register('Esc', () => {
    mainWindow.hide();
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
