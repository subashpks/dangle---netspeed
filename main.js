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
    } else if (process.platform === 'win32') {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      // Linux X11 / Wayland overlay
      mainWindow.setAlwaysOnTop(true, 'status');
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

function getAnchorX() {
  const state = store.loadState();
  const primaryDisplay = screen.getPrimaryDisplay();
  const screenWidth = primaryDisplay.bounds.width;
  const preset = state.positionPreset || 'top-right';

  if (preset === 'center') {
    return Math.round(screenWidth / 2);
  } else if (preset === 'top-left') {
    return 240;
  } else if (preset === 'tray' && tray) {
    const b = tray.getBounds();
    if (b && b.x > 0) {
      return Math.round(b.x + b.width / 2);
    }
  }
  // Default: 'top-right' (the usual floating position)
  return Math.max(160, Math.round(screenWidth - 250));
}

function setPositionPreset(preset) {
  store.saveState({ positionPreset: preset });
  sendAnchorPosition();
}

function sendAnchorPosition() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const anchorX = getAnchorX();
    mainWindow.webContents.send('init-anchor', anchorX);
  }
}

let cursorPollTimer = null;

function startCursorPolling() {
  if (cursorPollTimer) return;
  cursorPollTimer = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
      const pt = screen.getCursorScreenPoint();
      const bounds = mainWindow.getBounds();
      // Translate global screen coordinates to window client coordinates
      const relX = pt.x - bounds.x;
      const relY = pt.y - bounds.y;
      mainWindow.webContents.send('cursor-pos', { x: relX, y: relY });
    }
  }, 16); // ~60fps responsive tracking
}

function stopCursorPolling() {
  if (cursorPollTimer) {
    clearInterval(cursorPollTimer);
    cursorPollTimer = null;
  }
}

function toggleWindow() {
  if (!mainWindow) return;

  const now = Date.now();
  lastTrayClickTime = now;

  if (mainWindow.isVisible()) {
    stopCursorPolling();
    mainWindow.hide();
  } else {
    mainWindow.showInactive();
    sendAnchorPosition();
    startCursorPolling();
  }
}

function buildTrayMenu() {
  const state = store.loadState();
  const isVisible = mainWindow && mainWindow.isVisible();

  return Menu.buildFromTemplate([
    {
      label: isVisible ? '👁️ Hide Dangle (Click icon or ⌘⇧L)' : '✨ Show Dangle (Click icon or ⌘⇧L)',
      click: () => toggleWindow()
    },
    { type: 'separator' },
    {
      label: '🙏 Lord Vishnu & Krishna Collection',
      submenu: [
        {
          label: '🪔 Lord Venkateswara (ஏழுமலையான் பாலாஜி)',
          type: 'radio',
          checked: state.activeCharm === 'balaji_classic',
          click: () => switchCharm('balaji_classic')
        },
        {
          label: '✨ Modern Balaji Gold (நவீன பாலாஜி 1)',
          type: 'radio',
          checked: state.activeCharm === 'balaji_modern_1',
          click: () => switchCharm('balaji_modern_1')
        },
        {
          label: '🌟 Modern Balaji Aura (நவீன பாலாஜி 2)',
          type: 'radio',
          checked: state.activeCharm === 'balaji_modern_2',
          click: () => switchCharm('balaji_modern_2')
        },
        {
          label: '💎 Platinum Balaji (பிளாட்டினம் பாலாஜி)',
          type: 'radio',
          checked: state.activeCharm === 'balaji_platinum',
          click: () => switchCharm('balaji_platinum')
        },
        {
          label: '🪈 Venugopala Krishna (புல்லாங்குழல் கிருஷ்ணர்)',
          type: 'radio',
          checked: state.activeCharm === 'krishna_flute',
          click: () => switchCharm('krishna_flute')
        }
      ]
    },
    {
      label: '🦚 Lord Murugan Collection',
      submenu: [
        {
          label: '⚡ Golden Gnana Vel (ஞான வேல்)',
          type: 'radio',
          checked: state.activeCharm === 'murugan_vel_pendant',
          click: () => switchCharm('murugan_vel_pendant')
        },
        {
          label: '🦚 Mayil & Vel (Peacock & Spear)',
          type: 'radio',
          checked: state.activeCharm === 'murugan_vel_mayil',
          click: () => switchCharm('murugan_vel_mayil')
        },
        {
          label: '🙏 Yamirukka Bayamen (Portrait)',
          type: 'radio',
          checked: state.activeCharm === 'murugan_yamirukka',
          click: () => switchCharm('murugan_yamirukka')
        },
        {
          label: '✨ Yamirukka Bayamen (Calligraphy)',
          type: 'radio',
          checked: state.activeCharm === 'murugan_bayamen_badge',
          click: () => switchCharm('murugan_bayamen_badge')
        }
      ]
    },
    {
      label: '🔱 Lord Shiva Collection',
      submenu: [
        {
          label: '🕺 Chidambaram Nataraja (Cosmic Dancer)',
          type: 'radio',
          checked: state.activeCharm === 'shiva_gold_nataraj',
          click: () => switchCharm('shiva_gold_nataraj')
        },
        {
          label: '🪔 Surya Prabha Shivling (சூரிய பிரபை)',
          type: 'radio',
          checked: state.activeCharm === 'shiva_shivling',
          click: () => switchCharm('shiva_shivling')
        },
        {
          label: '⚡ Gold Trishul & Damru (திரிசூலம்)',
          type: 'radio',
          checked: state.activeCharm === 'shiva_gold_trishul',
          click: () => switchCharm('shiva_gold_trishul')
        },
        {
          label: '📿 Trishul & 5-Mukhi Rudraksha (ருத்ராட்சம்)',
          type: 'radio',
          checked: state.activeCharm === 'shiva_rudraksham',
          click: () => switchCharm('shiva_rudraksham')
        }
      ]
    },
    {
      label: '🕉️ Divine Deities & Sacred Symbols',
      submenu: [
        {
          label: '🌺 Durga Ma Shakthi (வீர துர்க்கை அம்மன்)',
          type: 'radio',
          checked: state.activeCharm === 'durga_ma',
          click: () => switchCharm('durga_ma')
        },
        {
          label: '🚩 Veera Anjaneyar (வீர ஆஞ்சநேயர்)',
          type: 'radio',
          checked: state.activeCharm === 'hanuman_anjaneyar',
          click: () => switchCharm('hanuman_anjaneyar')
        },
        {
          label: '🐯 Sabarimala Ayyappa (சுவாமியே சரணம் ஐயப்பா)',
          type: 'radio',
          checked: state.activeCharm === 'ayyappa_swamy',
          click: () => switchCharm('ayyappa_swamy')
        },
        {
          label: '卐 Sacred Vedic Swastik (மங்கள சுவஸ்திக்)',
          type: 'radio',
          checked: state.activeCharm === 'vedic_swastik',
          click: () => switchCharm('vedic_swastik')
        }
      ]
    },
    {
      label: '✝️ Christian & Jesus Collection',
      submenu: [
        {
          label: '✝️ Sacred Holy Cross (புனித சிலுவை)',
          type: 'radio',
          checked: state.activeCharm === 'christian_holy_cross',
          click: () => switchCharm('christian_holy_cross')
        },
        {
          label: '✨ Golden Siluvai (பொன் சிலுவை)',
          type: 'radio',
          checked: state.activeCharm === 'christian_siluvai_1',
          click: () => switchCharm('christian_siluvai_1')
        },
        {
          label: '🕊️ Ornate Siluvai Cross (அலங்கார சிலுவை)',
          type: 'radio',
          checked: state.activeCharm === 'christian_siluvai_2',
          click: () => switchCharm('christian_siluvai_2')
        },
        {
          label: '💫 Radiant Cross Pendant (ஒளிரும் சிலுவை)',
          type: 'radio',
          checked: state.activeCharm === 'christian_cross_3',
          click: () => switchCharm('christian_cross_3')
        },
        {
          label: '❤️ Sacred Heart Yesappa (இயேசு கிறிஸ்து)',
          type: 'radio',
          checked: state.activeCharm === 'christian_yesappa',
          click: () => switchCharm('christian_yesappa')
        }
      ]
    },
    {
      label: '☪️ Islamic Sacred Collection',
      submenu: [
        {
          label: '🌙 Islamic Crescent & Star (பிறை நிலவு & நட்சத்திரம்)',
          type: 'radio',
          checked: state.activeCharm === 'islam_crescent',
          click: () => switchCharm('islam_crescent')
        },
        {
          label: '🕌 Golden Dome Mosque (புனித மசூதி)',
          type: 'radio',
          checked: state.activeCharm === 'islam_mosque',
          click: () => switchCharm('islam_mosque')
        },
        {
          label: '🕋 Masjid Al-Haram Gold (புனித பள்ளிவாசல் 1)',
          type: 'radio',
          checked: state.activeCharm === 'islam_mosque_1',
          click: () => switchCharm('islam_mosque_1')
        },
        {
          label: '✨ Allah Sacred Calligraphy (அல்லாஹ் திருநாமம்)',
          type: 'radio',
          checked: state.activeCharm === 'islam_calligraphy_medallion',
          click: () => switchCharm('islam_calligraphy_medallion')
        },
        {
          label: '🌟 Luminous Minaret Mosque (மினாரட் மசூதி)',
          type: 'radio',
          checked: state.activeCharm === 'islam_mosque_minaret',
          click: () => switchCharm('islam_mosque_minaret')
        },
        {
          label: '🏮 Golden Crescent & Lantern (பிறை நிலவு & விளக்கு)',
          type: 'radio',
          checked: state.activeCharm === 'islam_crescent_lantern',
          click: () => switchCharm('islam_crescent_lantern')
        },
        {
          label: '🛡️ Sacred Shahada Shield (புனித கலிமா சின்னம்)',
          type: 'radio',
          checked: state.activeCharm === 'islam_shahada_gold',
          click: () => switchCharm('islam_shahada_gold')
        },
        {
          label: '🌸 Filigree Crescent Moon (அலங்கார பிறை நிலவு)',
          type: 'radio',
          checked: state.activeCharm === 'islam_crescent_floral',
          click: () => switchCharm('islam_crescent_floral')
        }
      ]
    },
    {
      label: '🙏 Shirdi Sai Baba Collection',
      submenu: [
        {
          label: '🪔 Dwarkamai Sai (Shraddha & Saburi)',
          type: 'radio',
          checked: state.activeCharm === 'sai_dwarkamai',
          click: () => switchCharm('sai_dwarkamai')
        },
        {
          label: '🧡 Shirdi Sai (Orange Headdress)',
          type: 'radio',
          checked: state.activeCharm === 'sai_samadhi',
          click: () => switchCharm('sai_samadhi')
        },
        {
          label: '🕊️ Sai Avadhoota (White Robes)',
          type: 'radio',
          checked: state.activeCharm === 'sai_silver',
          click: () => switchCharm('sai_silver')
        }
      ]
    },
    {
      label: '🔥 Meme & Pop Culture',
      submenu: [
        {
          label: '📱 iSai (iSai Baba Meme)',
          type: 'radio',
          checked: state.activeCharm === 'sai_isai',
          click: () => switchCharm('sai_isai')
        },
        {
          label: '✨ Megan Fox',
          type: 'radio',
          checked: state.activeCharm === 'meme_megan_fox',
          click: () => switchCharm('meme_megan_fox')
        },
        {
          label: '🌸 Sydney Sweeney',
          type: 'radio',
          checked: state.activeCharm === 'meme_sydney_sweeney',
          click: () => switchCharm('meme_sydney_sweeney')
        },
        {
          label: '🏍️ Thala Ajith',
          type: 'radio',
          checked: state.activeCharm === 'meme_ajith',
          click: () => switchCharm('meme_ajith')
        },
        {
          label: '🔥 Thalapathy Vijay (Action)',
          type: 'radio',
          checked: state.activeCharm === 'meme_vijay',
          click: () => switchCharm('meme_vijay')
        },
        {
          label: '💫 Wamiqa Gabbi',
          type: 'radio',
          checked: state.activeCharm === 'meme_wamiqa',
          click: () => switchCharm('meme_wamiqa')
        },
        {
          label: '🕵️ Vettaiyaadu Vilaiyaadu (Raghavan IPS)',
          type: 'radio',
          checked: state.activeCharm === 'vettaiyaadu',
          click: () => switchCharm('vettaiyaadu')
        }
      ]
    },
    {
      label: '🧿 Classic Protection Charms',
      submenu: [
        {
          label: '🕵️ Vettaiyaadu Talisman (வேட்டையாடு விளையாடு)',
          type: 'radio',
          checked: state.activeCharm === 'vettaiyaadu',
          click: () => switchCharm('vettaiyaadu')
        },
        {
          label: '🍋 Nimbu Mirchi (Lemon & Chilli)',
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
          label: '👺 Drishti Bommai (Old Classic)',
          type: 'radio',
          checked: state.activeCharm === 'drishti_old',
          click: () => switchCharm('drishti_old')
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
          label: '🖐️ Hamsa (Hand of Protection)',
          type: 'radio',
          checked: state.activeCharm === 'hamsa',
          click: () => switchCharm('hamsa')
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
      label: '🐼 Bubu & Dudu Collection',
      submenu: [
        {
          label: '💖 Bubu Blushing Heart',
          type: 'radio',
          checked: state.activeCharm === 'bubu_1',
          click: () => switchCharm('bubu_1')
        },
        {
          label: '👋 Bubu Joyful Wave',
          type: 'radio',
          checked: state.activeCharm === 'bubu_2',
          click: () => switchCharm('bubu_2')
        },
        {
          label: '🌸 Bubu Cozy Pillow',
          type: 'radio',
          checked: state.activeCharm === 'bubu_3',
          click: () => switchCharm('bubu_3')
        },
        {
          label: '💃 Bubu Happy Dance',
          type: 'radio',
          checked: state.activeCharm === 'bubu_4',
          click: () => switchCharm('bubu_4')
        },
        {
          label: '🧢 Bubu Warm Winter Hat',
          type: 'radio',
          checked: state.activeCharm === 'bubu_5',
          click: () => switchCharm('bubu_5')
        },
        {
          label: '😊 Bubu Sweet Smile',
          type: 'radio',
          checked: state.activeCharm === 'bubu_6',
          click: () => switchCharm('bubu_6')
        },
        {
          label: '🤗 Bubu Cheerful Hug',
          type: 'radio',
          checked: state.activeCharm === 'bubu_7',
          click: () => switchCharm('bubu_7')
        },
        {
          label: '✨ Bubu Sparkle Eyes',
          type: 'radio',
          checked: state.activeCharm === 'bubu_8',
          click: () => switchCharm('bubu_8')
        },
        {
          label: '😉 Bubu Playful Wink',
          type: 'radio',
          checked: state.activeCharm === 'bubu_9',
          click: () => switchCharm('bubu_9')
        },
        {
          label: '🐻 Dudu Gentle Brown Bear',
          type: 'radio',
          checked: state.activeCharm === 'dudu_1',
          click: () => switchCharm('dudu_1')
        },
        {
          label: '💤 Dudu Sleepy Head',
          type: 'radio',
          checked: state.activeCharm === 'dudu_2',
          click: () => switchCharm('dudu_2')
        },
        {
          label: '🕶️ Dudu Cool Sunglasses',
          type: 'radio',
          checked: state.activeCharm === 'dudu_3',
          click: () => switchCharm('dudu_3')
        },
        {
          label: '😜 Dudu Silly Winking Bear',
          type: 'radio',
          checked: state.activeCharm === 'dudu_4',
          click: () => switchCharm('dudu_4')
        },
        {
          label: '💕 Bubu & Dudu Sweetheart Hug',
          type: 'radio',
          checked: state.activeCharm === 'bubu_dudu_pair_1',
          click: () => switchCharm('bubu_dudu_pair_1')
        },
        {
          label: '🧸 Bubu & Dudu Cuddle Duo',
          type: 'radio',
          checked: state.activeCharm === 'bubu_dudu_pair_2',
          click: () => switchCharm('bubu_dudu_pair_2')
        },
        {
          label: '☕ Bubu & Dudu Teatime Fun',
          type: 'radio',
          checked: state.activeCharm === 'bubu_dudu_pair_3',
          click: () => switchCharm('bubu_dudu_pair_3')
        },
        {
          label: '🏖️ Bubu & Dudu Beach Adventure',
          type: 'radio',
          checked: state.activeCharm === 'bubu_dudu_pair_4',
          click: () => switchCharm('bubu_dudu_pair_4')
        },
        {
          label: '👒 Bubu & Dudu Straw Hat Trip',
          type: 'radio',
          checked: state.activeCharm === 'bubu_dudu_pair_5',
          click: () => switchCharm('bubu_dudu_pair_5')
        },
        {
          label: '🌟 Bubu & Dudu Forever Friends',
          type: 'radio',
          checked: state.activeCharm === 'bubu_dudu_pair_6',
          click: () => switchCharm('bubu_dudu_pair_6')
        }
      ]
    },
    { type: 'separator' },
    {
      label: '📍 Screen Position',
      submenu: [
        {
          label: '↗️ Top Right (Default / Usual)',
          type: 'radio',
          checked: (state.positionPreset || 'top-right') === 'top-right',
          click: () => setPositionPreset('top-right')
        },
        {
          label: '🎯 Center Notch (MacBook Display)',
          type: 'radio',
          checked: state.positionPreset === 'center',
          click: () => setPositionPreset('center')
        },
        {
          label: '↖️ Top Left',
          type: 'radio',
          checked: state.positionPreset === 'top-left',
          click: () => setPositionPreset('top-left')
        },
        {
          label: '🪔 Align with Tray Icon',
          type: 'radio',
          checked: state.positionPreset === 'tray',
          click: () => setPositionPreset('tray')
        }
      ]
    },
    { type: 'separator' },
    {
      label: '✨ Charm Actions',
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
  let trayIconPath;
  if (process.platform === 'win32') {
    trayIconPath = path.join(__dirname, 'assets', 'icon.ico');
  } else if (process.platform === 'linux') {
    trayIconPath = path.join(__dirname, 'assets', 'icon.iconset', 'icon_32x32.png');
  } else {
    trayIconPath = path.join(__dirname, 'assets', 'trayTemplate.png');
  }

  tray = new Tray(trayIconPath);
  tray.setToolTip('Lucky Dangle - Click to Toggle On/Off | Right-Click for Menu');
  tray.setIgnoreDoubleClickEvents(true);

  // On Windows and Linux, setContextMenu handles click/popup menus reliably
  if (process.platform === 'win32' || process.platform === 'linux') {
    tray.setContextMenu(buildTrayMenu());
  }

  // Left click: Toggle Dangle on and off immediately
  tray.on('click', () => {
    toggleWindow();
  });

  // Right click / Secondary click: Open settings & charm selection menu
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
  startCursorPolling();

  // Listen for multi-monitor DPI, resolution, or display layout changes
  screen.on('display-metrics-changed', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      mainWindow.setBounds({ x: 0, y: 0, width, height });
      sendAnchorPosition();
    }
  });

  screen.on('display-added', () => {
    sendAnchorPosition();
  });

  screen.on('display-removed', () => {
    sendAnchorPosition();
  });
});

app.on('window-all-closed', (event) => {
  if (process.platform === 'darwin') {
    event.preventDefault();
  } else {
    app.quit();
  }
});

app.on('will-quit', () => {
  stopCursorPolling();
  globalShortcut.unregisterAll();
});
