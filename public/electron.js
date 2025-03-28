require('electron-log').transports.file.level = 'info';
const os = require('os');
const ua = require('universal-analytics');
const log = require('electron-log');
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeTheme, screen, dialog, shell, clipboard } = require('electron');
const AutoLaunch = require('electron-auto-launch');
const { autoUpdater } = require('electron-updater');
const localShortcut = require('electron-localshortcut');
const path = require('path');
const Store = require('electron-store');
const appVersion = require('../package.json').version;

// Initialize store
const store = new Store();

// Window state constants
const VIEW_STATES = {
  BROWSER: 'browser',
  AI_AGENT: 'aiAgent'
};

// Fixed dimensions for search view
const SEARCH_DIMENSIONS = {
  width: 750,
  height: 48
};

let mainWindow;
let tray;
let activeView = 'none'; // Track current active view
let newHRequest;
let newHInterface;
const windowPositions = {};
let userShortcut = "Alt+Space";
const isDevelopment = !app.isPackaged;
const user = ua(isDevelopment ? 'UA-24200854-1' : 'UA-242008654-1');

// Function to calculate default heights based on screen size
function getDefaultDimensions(viewState) {
  const { height } = screen.getPrimaryDisplay().workAreaSize;
  const winY = 30;
  return {
    width: 890,
    height: viewState === VIEW_STATES.BROWSER ? 
      height - winY - 250 :  // Browser height (original newHRequest)
      height - winY - 150    // AI Agent height (original newHInterface)
  };
}

// Function to save window dimensions
function saveWindowDimensions(viewState) {
  const bounds = mainWindow.getBounds();
  store.set(`windowState.${viewState}`, { 
    width: bounds.width, 
    height: bounds.height 
  });
}

// Function to get saved dimensions
function getWindowDimensions(viewState) {
  const savedState = store.get(`windowState.${viewState}`);
  if (savedState) {
    return savedState;
  }
  // If no saved state, use default dynamic calculations
  return getDefaultDimensions(viewState);
}

function getUserOSInfo() {
  const platform = os.platform();
  const arch = os.arch();
  const release = os.release();

  return {
    platform,
    arch,
    release
  };
}

function sendOSInfoToAnalytics() {
  const osInfo = getUserOSInfo();
  user.event("OS Info", "Platform", osInfo.platform).send();
  user.event("OS Info", "Architecture", osInfo.arch).send();
  user.event("OS Info", "Release", osInfo.release).send();
}

function registerUserShortcut(shortcut) {
  globalShortcut.unregisterAll();

  globalShortcut.register(shortcut, () => {
    if (mainWindow?.isVisible() && !mainWindow?.isFocused()) {
      showWindowOnActiveDisplay();
      mainWindow.show();
      user.event('App', 'Opened').send();
      mainWindow.focus();
    } else if (mainWindow?.isVisible()) {
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
}

function getDisplayIdentifier(display) {
  return `${display.id}-${display.bounds.x}-${display.bounds.y}`;
}

function showWindowOnActiveDisplay() {
  const activeDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const displayIdentifier = getDisplayIdentifier(activeDisplay);

  let position = windowPositions[displayIdentifier];

  if (!position) {
    const { y, width } = activeDisplay.bounds;
    const offsetY = 50;
    position = [Math.round(width / 5), y + offsetY]; // Center horizontally
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
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const winY = 30;

  // Get initial dimensions from saved state or use defaults
  const browserState = getWindowDimensions(VIEW_STATES.BROWSER);
  
  mainWindow = new BrowserWindow({
    width: browserState.width,
    minWidth: 500,
    height: browserState.height,
    minHeight: 125,
    frame: false,
    show: true,
    skipTaskbar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#FFFFFF',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, isDevelopment ? '../public/preload.js' : '../build/preload.js'),
    },
    y: 30,
  });

  // Immediately set to search dimensions since we start in search view
  mainWindow.setSize(SEARCH_DIMENSIONS.width, SEARCH_DIMENSIONS.height);


  mainWindow.loadURL(isDevelopment ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.setOpacity(0.95);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  localShortcut.register(mainWindow, 'Esc', () => {
    mainWindow.hide();
  });
}

app.on('ready', () => {
  log.info('App version: ', appVersion);
  user.pageview('/').send();
  sendOSInfoToAnalytics();

  // Set session permissions for webview
  const ses = require('electron').session;
  ses.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: ws:"]
      }
    });
  });

  const updateInterval = 60 * 60 * 1000;
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, updateInterval);

  const autoLauncher = new AutoLaunch({ name: 'AirLight' });
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

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download speed: ${progressObj.bytesPerSecond}`);
    log.info(`Downloaded ${progressObj.percent}%`);
    log.info(`Download remaining time: ${progressObj.remaining} seconds`);
  });

  autoUpdater.on('error', (error) => {
    log.info('Error during update:', error);
    mainWindow.webContents.send('update-error', error);
  });

  autoUpdater.on('update-downloaded', async () => {
    log.info('Update downloaded');
    mainWindow.webContents.send('update-downloaded');

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Install now', 'Later'],
      defaultId: 0,
      title: 'Update Ready',
      message: 'A new update is ready to install. Do you want to install it now and restart the application?',
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url);
    user.event('App', 'Clicked on External Link').send();
  });

  ipcMain.on('browserRequested', (event, onRequest) => {
    if (onRequest) {
      activeView = VIEW_STATES.BROWSER;
      const savedState = getWindowDimensions(VIEW_STATES.BROWSER);
      mainWindow.setSize(savedState.width, savedState.height, true);
    } else {
      activeView = 'none';
      mainWindow.setSize(SEARCH_DIMENSIONS.width, SEARCH_DIMENSIONS.height, true);
    }
  });

  ipcMain.on('aiAgentRequested', (event, interfaceVisible) => {
    if (interfaceVisible) {
      activeView = VIEW_STATES.AI_AGENT;
      const savedState = getWindowDimensions(VIEW_STATES.AI_AGENT);
      mainWindow.setSize(savedState.width, savedState.height, true);
      user.event('App', 'AI Agent Interface Enabled').send();
    }
  });

  ipcMain.on('reset-to-search', () => {
    activeView = 'none';
    mainWindow.setSize(SEARCH_DIMENSIONS.width, SEARCH_DIMENSIONS.height, true);
  });

  // Save dimensions when window is resized
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    // Only save if we're in a view that should remember dimensions
    if (activeView !== 'none' && bounds.height !== SEARCH_DIMENSIONS.height) {
      saveWindowDimensions(activeView);
    }
  });

  // Remove or modify other size-related IPC handlers that might interfere
  ipcMain.on("set-window-height", (event, newHeight) => {
    const [width, _] = mainWindow.getSize();
    mainWindow.setSize(width, newHeight);
    mainWindow.show();
  });

  ipcMain.on('increase-window-height', () => {
    const currentBounds = mainWindow.getBounds();
    mainWindow.setSize(currentBounds.width, 775);
  });

  // trayIcon = path.join(__dirname, '../build/trayiconTemplate.png');
  // trayIcon = path.join(__dirname, '../public/trayiconTemplate.png');
  trayIcon = path.join(__dirname, isDevelopment ? '../public/trayiconTemplate.png' : '../build/trayiconTemplate.png'),
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Ask Anything',
      click: () => {
        (mainWindow && mainWindow.isVisible()) ? mainWindow.hide() : mainWindow.show();
      },
    },
    {
      label: 'Change Shortcut',
      click: () => {
        mainWindow?.webContents.send('toggle-change-shortcut'); 
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

  tray.setToolTip('Ask Anything');
  tray.setContextMenu(contextMenu);

  registerUserShortcut(userShortcut);

  ipcMain.on('update-custom-shortcut', (event, newShortcut) => {
    userShortcut = newShortcut;
    registerUserShortcut(userShortcut);
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
