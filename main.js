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
    icon: path.join(__dirname, 'address-book-frontend/src/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove default menu
  mainWindow.setMenuBarVisibility(false);

  // Wait for backend to be ready
  const checkBackend = () => {
    http.get('http://localhost:3000', (res) => {
      mainWindow.loadURL('http://localhost:3000');
    }).on('error', () => {
      setTimeout(checkBackend, 1000);
    });
  };

  checkBackend();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const serverPath = path.join(__dirname, 'address-book-backend/server.js');
  backendProcess = fork(serverPath, [], {
    cwd: path.join(__dirname, 'address-book-backend'),
    env: { ...process.env, PORT: 3000 }
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
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
