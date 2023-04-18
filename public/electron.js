require('electron-log').transports.file.level = 'info';
const ua = require('universal-analytics');
const log = require('electron-log');
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeTheme, screen, dialog, shell } = require('electron');
const AutoLaunch = require('electron-auto-launch');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const appVersion = require('../package.json').version;
let mainWindow;
let tray;
let newHRequest;
let newHInterface;
const windowPositions = {};

async function showUpdateDialog(downloadUrl) {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Download now', 'Later'],
    defaultId: 0,
    title: 'Update Available',
    message: 'A new update is available. Do you want to download it now?',
  });

  if (result.response === 0) {
    shell.openExternal(downloadUrl);
  }
}


function getDisplayIdentifier(display) {
  return `${display.id}-${display.bounds.x}-${display.bounds.y}`;
}

function showWindowOnActiveDisplay() {
  const activeDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const displayIdentifier = getDisplayIdentifier(activeDisplay);

  let position = windowPositions[displayIdentifier];

  if (!position) {
    const { x, y } = activeDisplay.bounds;
    const offsetX = 30;
    const offsetY = 50;
    position = [x + offsetX, y + offsetY];
  }

  if (mainWindow) {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setPosition(...position);
    mainWindow.show();
    mainWindow.focus();
    setTimeout(() => {
      mainWindow.setVisibleOnAllWorkspaces(false, { visibleOnFullScreen: true });
    }, 100);
  } else {
    createWindow(...position);
  }
}

function setWindowBackgroundColor() {
  if (mainWindow) {
    const backgroundColor = nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#FFFFFF';
    mainWindow.setBackgroundColor(backgroundColor);
  }
}


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
      enableRemoteModule: false,
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

}




app.on('ready', () => {
  log.info('App version: ', appVersion);
  const user = ua('UA-242008654-1'); // Replace with your actual tracking ID
  user.pageview('/').send();
  const updateInterval = 60 * 60 * 1000; // 1 hour in milliseconds
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, updateInterval);

  const autoLauncher = new AutoLaunch({ name: 'Chad' });
  autoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLauncher.enable();
  });
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();
  setWindowBackgroundColor();

  nativeTheme.on('updated', () => {
    setWindowBackgroundColor();
  });


  autoUpdater.on('update-available', () => {
    log.info('Update available');
    const downloadUrl = 'https://www.constitute.ai/42a36fef4cecb27c87';
    showUpdateDialog(downloadUrl);
  });


  // autoUpdater.on('download-progress', (progressObj) => {
  //   log.info(`Download speed: ${progressObj.bytesPerSecond}`);
  //   log.info(`Downloaded ${progressObj.percent}%`);
  //   log.info(`Download remaining time: ${progressObj.remaining} seconds`);
  // });

  // autoUpdater.on('error', (error) => {
  //   log.info('Error during update:', error);
  //   mainWindow.webContents.send('update-error', error);
  // });

  // autoUpdater.on('update-downloaded', async () => {
  //   log.info('Update downloaded');
  //   mainWindow.webContents.send('update-downloaded');

  //   const result = await dialog.showMessageBox(mainWindow, {
  //     type: 'question',
  //     buttons: ['Download now', 'Later'],
  //     defaultId: 0,
  //     title: 'Update Ready',
  //     message: 'A new update is ready to install. Do you want to install it now and restart the application?',
  //   });

  //   if (result.response === 0) {
  //     autoUpdater.quitAndInstall(false, true);
  //     }
  //   });

  ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url);
    user.event('App', 'Clicked on External Link').send();
  });

  ipcMain.on('quickSearchRequested', (event, onRequest) => {
    const newHeight = onRequest ? newHRequest : 48;
    const currentWidth = mainWindow.getBounds().width;
    mainWindow.setSize(currentWidth, newHeight, true);
  });

  ipcMain.on('showLangInterface', (event, interfaceVisible) => {
    if (interfaceVisible) {
    const newWidth = 750;
    mainWindow.setSize(newWidth, newHInterface, true);
    user.event('App', 'Lang Interface Enabled').send();
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
      label: 'Check for updates',
      click: () => {
        autoUpdater.checkForUpdates();
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
      showWindowOnActiveDisplay();
      mainWindow.show();
      user.event('App', 'Opened').send();
      mainWindow.focus();
    } else if (mainWindow.isVisible()) {
      const activeDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
      const displayIdentifier = getDisplayIdentifier(activeDisplay);
      windowPositions[displayIdentifier] = mainWindow.getPosition();
      mainWindow.hide();
      user.event('App', 'Hidden').send();
    } else {
      showWindowOnActiveDisplay();
      mainWindow.show();
      user.event('App', 'Opened').send();
    }
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
