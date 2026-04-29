const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Address Book CRM",
    icon: path.join(__dirname, 'address-book-frontend/public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);

  let attempts = 0;
  const maxAttempts = 30; // 30 seconds timeout

  const checkBackend = () => {
    http.get('http://localhost:3000', (res) => {
      mainWindow.loadURL('http://localhost:3000');
    }).on('error', () => {
      attempts++;
      if (attempts > maxAttempts) {
        dialog.showErrorBox("Startup Error", "The backend server failed to start within 30 seconds. Please check if WAMP is running and port 3000 is free.");
        return;
      }
      setTimeout(checkBackend, 1000);
    });
  };

  checkBackend();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const fs = require('fs');
  const serverPath = path.join(__dirname, 'address-book-backend/server.js');
  
  if (!fs.existsSync(serverPath)) {
    dialog.showErrorBox("File Missing", "Critical app file missing: " + serverPath);
    return;
  }

  let lastError = "";

  backendProcess = fork(serverPath, [], {
    cwd: path.join(__dirname, 'address-book-backend'),
    env: { ...process.env, PORT: 3000 },
    stdio: ['inherit', 'pipe', 'pipe', 'ipc']
  });

  backendProcess.stderr.on('data', (data) => {
    lastError += data.toString();
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('error', (err) => {
    dialog.showErrorBox("Backend Error", "Failed to start background process: " + err.message);
  });
  
  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      dialog.showErrorBox("Backend Crash", "The background server crashed.\n\nReason:\n" + (lastError || "Unknown error (check if port 3000 is busy)"));
    }
  });
}

app.on('ready', () => {
  startBackend();
  createWindow();
});

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
