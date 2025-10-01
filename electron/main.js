const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

const isDev = process.env.NODE_ENV === 'development';
const devURL = process.env.APP_DEV_URL || 'http://localhost:8081';

function createWindow() {

  console.log("starting", isDev)
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    win.loadURL(devURL);
  } else {
    win.loadFile(path.join(__dirname, '../dist-web/index.html'));
  }

  // Always open DevTools (both development and production)
  win.webContents.openDevTools();

  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win.show();
  });

  // Handle window closed
  win.on('closed', () => {
    // Dereference the window object
  });
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
