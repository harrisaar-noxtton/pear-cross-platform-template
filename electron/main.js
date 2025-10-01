// electron/main.js
const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

const isDev = process.env.NODE_ENV === 'development';
const devURL = process.env.APP_DEV_URL || 'http://localhost:8081';

function createWindow() {
  console.log("starting", isDev);
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webSecurity: !isDev, // Disable web security in dev for easier debugging
      allowRunningInsecureContent: !isDev,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
  });

  // Add error handling for failed loads
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('Failed to load:', errorDescription, validatedURL);
    // Retry loading after a short delay
    setTimeout(() => {
      if (isDev) {
        win.loadURL(devURL);
      } else {
        win.loadFile(path.join(__dirname, '../dist-web/index.html'));
      }
    }, 1000);
  });

  // Load the app
  if (isDev) {
    // Add a small delay to ensure dev server is fully ready
    setTimeout(() => {
      win.loadURL(devURL);
    }, 500);
  } else {
    win.loadFile(path.join(__dirname, '../dist-web/index.html'));
  }

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Always open DevTools
  win.webContents.openDevTools();
}



// App event handlers
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Set up menu - keep default menu to access DevTools via menu
  if (!isDev) {
    // You might want to keep the menu in production too for DevTools access
    // Comment out the line below if you want to keep the default menu
    // Menu.setApplicationMenu(null);
  }
});

// Rest of your code remains the same...
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});
