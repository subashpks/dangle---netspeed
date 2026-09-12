const { app, BrowserWindow, Tray, Menu, screen, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const store = require('./src/store');

let tray = null;
let mainWindow = null;
let lastTrayClickTime = 0;

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Immediately hide dock icon on macOS menu bar app
if (app.dock) {
  app.dock.hide();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      toggleWindow();
    } else {
      mainWindow.focus();
    }
  }
});

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (mainWindow.setAlwaysOnTop) {
    if (process.platform === 'darwin') {
      mainWindow.setAlwaysOnTop(true, 'floating');
    } else {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }

  // Enable click-through by default so users can click apps beneath the cord
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] [${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.once('did-finish-load', () => {
    sendAnchorPosition();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getTrayAnchorX() {
  if (tray) {
    const b = tray.getBounds();
    return Math.round(b.x + b.width / 2);
  }
  const primaryDisplay = screen.getPrimaryDisplay();
  return Math.round(primaryDisplay.bounds.width - 250);
}

function sendAnchorPosition() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const anchorX = getTrayAnchorX();
    mainWindow.webContents.send('init-anchor', anchorX);
  }
}

function toggleWindow() {
  if (!mainWindow) return;

  const now = Date.now();
  lastTrayClickTime = now;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.showInactive();
    sendAnchorPosition();
  }
}

function buildTrayMenu() {
  const state = store.loadState();

  return Menu.buildFromTemplate([
    {
      label: 'Lucky Dangle (⌘⇧L to toggle)',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Cultural Charms',
      submenu: [
        {
          label: '🍋 Nimbu Mirchi (Indian Talisman)',
          type: 'radio',
          checked: state.activeCharm === 'nimbu',
          click: () => switchCharm('nimbu')
        },
        {
          label: '👹 Drishti Bommai (Guardian Mask)',
          type: 'radio',
          checked: state.activeCharm === 'drishti',
          click: () => switchCharm('drishti')
        },
        {
          label: '🎋 Daruma Doll (Wishing Charm)',
          type: 'radio',
          checked: state.activeCharm === 'daruma',
          click: () => switchCharm('daruma')
        },
        {
          label: '🧿 Nazar Boncuğu (Evil Eye)',
          type: 'radio',
          checked: state.activeCharm === 'nazar',
          click: () => switchCharm('nazar')
        },
        {
          label: '🪶 Dreamcatcher (Native American)',
          type: 'radio',
          checked: state.activeCharm === 'dreamcatcher',
          click: () => switchCharm('dreamcatcher')
        }
      ]
    },
    {
      label: 'Charm Actions',
      submenu: [
        {
          label: '✨ Hang Fresh Nimbu (Reset Decay)',
          click: () => {
            store.saveState({ nimbuHungTime: Date.now() });
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('charm-action', 'reset-decay', { hungTime: Date.now() });
            }
          }
        },
        {
          label: '🎨 Repaint Drishti Bommai',
          submenu: [
            {
              label: '🔴 Traditional Crimson',
              click: () => setDrishtiColor('crimson')
            },
            {
              label: '🟠 Terracotta Orange',
              click: () => setDrishtiColor('terracotta')
            },
            {
              label: '🟡 Golden Demon',
              click: () => setDrishtiColor('gold')
            },
            {
              label: '⚫ Obsidian Shadow',
              click: () => setDrishtiColor('black')
            }
          ]
        },
        {
          label: '👁️ Daruma: Paint Left Eye (Make Wish)',
          click: () => {
            store.saveState({ darumaState: 1 });
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('charm-action', 'set-daruma-state', { state: 1 });
            }
          }
        },
        {
          label: '🎉 Daruma: Paint Right Eye (Wish Fulfilled!)',
          click: () => {
            store.saveState({ darumaState: 2 });
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('charm-action', 'set-daruma-state', { state: 2 });
            }
          }
        },
        {
          label: '🔄 Reset Daruma (New Blank Doll)',
          click: () => {
            store.saveState({ darumaState: 0 });
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('charm-action', 'set-daruma-state', { state: 0 });
            }
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Quit Lucky Dangle',
      accelerator: 'Command+Q',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function switchCharm(charmId) {
  store.saveState({ activeCharm: charmId });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('change-charm', charmId);
  }
}

function setDrishtiColor(palette) {
  store.saveState({ drishtiPalette: palette });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('charm-action', 'set-drishti-palette', { palette });
  }
}

function createTray() {
  const trayIconPath = process.platform === 'win32'
    ? path.join(__dirname, 'assets', 'icon.ico')
    : path.join(__dirname, 'assets', 'trayTemplate.png');
  tray = new Tray(trayIconPath);
  tray.setToolTip('Lucky Dangle - Cultural Charms (⌘⇧L)');
  tray.setIgnoreDoubleClickEvents(true);

  tray.on('click', (_event, bounds) => {
    toggleWindow(bounds);
  });

  tray.on('right-click', () => {
    tray.popUpContextMenu(buildTrayMenu());
  });
}

// Global hotkey registration
function setupGlobalShortcut() {
  try {
    globalShortcut.register('CommandOrControl+Shift+L', () => {
      toggleWindow();
    });
  } catch (err) {
    console.warn('Could not register global hotkey CommandOrControl+Shift+L:', err);
  }
}

// Click-through window control
ipcMain.on('set-ignore-mouse-events', (_event, ignore, forward) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: forward !== false });
  }
});

// State IPC Handlers
ipcMain.handle('get-state', () => {
  return store.loadState();
});

ipcMain.handle('save-state', (_event, partial) => {
  return store.saveState(partial);
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

app.whenReady().then(() => {
  createTray();
  createWindow();
  setupGlobalShortcut();
  mainWindow.showInactive();
});

app.on('window-all-closed', (event) => {
  if (process.platform === 'darwin') {
    event.preventDefault();
  } else {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
