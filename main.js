const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.loadFile('src/index.html');

  // Open the DevTools for debugging.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle file import events
ipcMain.handle('import-images', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'tiff'] }
    ]
  });
  if (canceled) {
    return [];
  } else {
    return filePaths;
  }
});

ipcMain.handle('import-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled || filePaths.length === 0) {
        return [];
    }
    const folderPath = filePaths[0];
    const allFiles = fs.readdirSync(folderPath);
    const imageFiles = allFiles.filter(file => {
        const extension = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'].includes(extension);
    }).map(file => path.join(folderPath, file));

    return imageFiles;
});
