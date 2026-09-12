const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const STATE_FILE = path.join(app.getPath('userData'), 'lucky-dangle-state.json');

const DEFAULT_STATE = {
  activeCharm: 'nimbu',
  anchorX: 150,
  nimbuHungTime: Date.now(),
  drishtiPalette: 'crimson',
  darumaState: 0, // 0 = no eyes, 1 = one eye (wish made), 2 = both eyes (fulfilled)
  darumaWish: ''
};

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return { ...DEFAULT_STATE, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Failed to read lucky-dangle-state.json:', err);
  }
  return { ...DEFAULT_STATE };
}

function saveState(partialState) {
  try {
    const current = loadState();
    const updated = { ...current, ...partialState };
    fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Failed to write lucky-dangle-state.json:', err);
    return null;
  }
}

module.exports = {
  loadState,
  saveState
};
