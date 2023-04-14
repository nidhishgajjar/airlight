const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeTheme, screen } = require('electron');
const AutoLaunch = require('electron-auto-launch');
const { autoUpdater } = require('electron-updater');
const path = require('path');
let mainWindow;
let tray;
let newHRequest;
let newHInterface;


function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winY = 50;
  newHRequest = height - winY - 250;
  newHInterface = height - winY - 100;


  mainWindow = new BrowserWindow({
    width: 500,
    maxWidth: 750,
    minWidth: 500,
    height: 48,
    minHeight: 48,
    frame: false,
    show: false,
    skipTaskbar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#FFFFFF',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      webviewTag: true,
      preload: path.join(__dirname, '../build/preload.js'),
      // preload: path.join(__dirname, '../public/preload.js'),
    },
    x: 30,
    y: 50,
  });

  mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  // mainWindow.loadURL('http://localhost:3000');
  // mainWindow.webContents.openDevTools();

  mainWindow.setOpacity(0.95);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  autoUpdater.checkForUpdatesAndNotify();
}


app.on('ready', () => {
  const autoLauncher = new AutoLaunch({ name: 'Chad' });
  autoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLauncher.enable();
  });
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();

  ipcMain.on('quickSearchRequested', (event, onRequest) => {
    const newHeight = onRequest ? newHRequest : 48;
    const currentWidth = mainWindow.getBounds().width;
    mainWindow.setSize(currentWidth, newHeight, true);
  });

  ipcMain.on('showLangInterface', (event, interfaceVisible) => {
    if (interfaceVisible) {
    const newWidth = 750;
    mainWindow.setSize(newWidth, newHInterface, true);
    }
  });

  ipcMain.on('textarea-height-changed', (event, newHeight) => {
    const updatedWindowHeight = newHeight;

    mainWindow.setSize(mainWindow.getBounds().width, updatedWindowHeight, true);
  });

  ipcMain.handle("startDrag", (event) => {
    if (mainWindow) {
      mainWindow.webContents.startDrag({
        file: path.join(__dirname, "../build/drag.png"),
        icon: path.join(__dirname, "../build/drag.png"),
      });
    }
  });

  trayIcon = path.join(__dirname, '../build/trayiconTemplate.png');
  // trayIcon = path.join(__dirname, '../public/trayiconTemplate.png');
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ask Chad      ⌥ + space',
      click: () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
    },
    {
      label: 'Disable',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Ask Chad');
  tray.setContextMenu(contextMenu);

  globalShortcut.register('Alt+Space', () => {
    if (mainWindow.isVisible() && !mainWindow.isFocused()) {
      mainWindow.show();
      mainWindow.focus();
    } else if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
  globalShortcut.register('Esc', () => {
    mainWindow.hide();
  });


  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });

  ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
  });

});


app.on('window-all-closed', () => {
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
