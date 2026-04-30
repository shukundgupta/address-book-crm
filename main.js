const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let backendProcess;
const configPath = path.join(app.getPath('userData'), 'config.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Address Book CRM",
    icon: path.join(__dirname, 'address-book-frontend/public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 0.9,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setMenuBarVisibility(false);

  /* =========================
     ZOOM FEATURES
  ========================= */
  const webContents = mainWindow.webContents;

  // Global Shortcuts for Zoom
  webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.key === '=' || input.key === '+') {
        webContents.setZoomFactor(Math.min(3.0, webContents.getZoomFactor() + 0.1));
        event.preventDefault();
      } else if (input.key === '-') {
        webContents.setZoomFactor(Math.max(0.5, webContents.getZoomFactor() - 0.1));
        event.preventDefault();
      } else if (input.key === '0') {
        webContents.setZoomFactor(1.0);
        event.preventDefault();
      }
    }
  });

  // Optional: Mouse Wheel Zoom (Ctrl + Scroll)
  mainWindow.webContents.on('mouse-wheel', (event, wheel) => {
    if (wheel.ctrlKey) {
      const zoomFactor = webContents.getZoomFactor();
      if (wheel.deltaY < 0) {
        webContents.setZoomFactor(Math.min(3.0, zoomFactor + 0.05));
      } else {
        webContents.setZoomFactor(Math.max(0.5, zoomFactor - 0.05));
      }
    }
  });

  // 1. Check if config exists - if not, show setup
  if (!fs.existsSync(configPath)) {
    mainWindow.loadFile('setup.html');
  } else {
    // 2. Load Config and Start
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.mode === 'server') {
        startBackend();
        waitForServer('localhost');
      } else {
        // Client Mode - Just connect to the server IP
        waitForServer(config.server_ip);
      }
    } catch (e) {
      mainWindow.loadFile('setup.html');
    }
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

const DEFAULT_PORT = 3000;

function waitForServer(host) {
  let attempts = 0;
  const maxAttempts = 45; // 45 seconds for LAN discovery
  const url = `http://${host}:${DEFAULT_PORT}`;

  const check = () => {
    http.get(url, (res) => {
      mainWindow.loadURL(url);
    }).on('error', (err) => {
      attempts++;
      if (attempts > maxAttempts) {
        dialog.showErrorBox("Connection Error", 
          `Could not connect to the CRM server at ${url}.\n\n` +
          `1. Ensure the Server PC is ON.\n` +
          `2. Ensure the Server PC has its CRM app open.\n` +
          `3. Check if both PCs are on the same LAN Network.`);
        app.exit();
        return;
      }
      setTimeout(check, 1000);
    });
  };

  check();
}

function startBackend() {
  const serverPath = path.join(__dirname, 'address-book-backend/server.js');
  
  if (!fs.existsSync(serverPath)) {
    dialog.showErrorBox("File Missing", "Critical app file missing: " + serverPath);
    return;
  }

  let lastError = "";
  backendProcess = fork(serverPath, [], {
    cwd: path.join(__dirname, 'address-book-backend'),
    env: { ...process.env, PORT: DEFAULT_PORT },
    stdio: ['inherit', 'pipe', 'pipe', 'ipc']
  });

  backendProcess.stderr.on('data', (data) => {
    lastError += data.toString();
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      dialog.showErrorBox("Backend Crash", `The background server crashed.\n\nReason:\n` + (lastError || `Unknown error (check if port ${DEFAULT_PORT} is busy)`));
    }
  });
}

// Handle Configuration Saving from setup.html
ipcMain.on('save-config', (event, config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config));
    app.relaunch();
    app.exit();
  } catch (err) {
    dialog.showErrorBox("Settings Error", "Failed to save settings: " + err.message);
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
