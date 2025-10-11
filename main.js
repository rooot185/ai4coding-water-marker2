const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

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

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

// Helper function to calculate watermark position
function calculateWatermarkPosition(imageWidth, imageHeight, textWidth, textHeight, position) {
    let x = 0, y = 0;
    const margin = Math.min(imageWidth, imageHeight) * 0.05; // 5% margin

    const [yPos, xPos] = position.split('-');

    // Calculate Y position
    switch (yPos) {
        case 'top':
            y = margin;
            break;
        case 'bottom':
            y = imageHeight - textHeight - margin;
            break;
        default: // center
            y = (imageHeight - textHeight) / 2;
            break;
    }

    // Calculate X position
    switch (xPos) {
        case 'left':
            x = margin;
            break;
        case 'right':
            x = imageWidth - textWidth - margin;
            break;
        default: // center
            x = (imageWidth - textWidth) / 2;
            break;
    }

    return { x: Math.round(x), y: Math.round(y) };
}

// Handle export images
ipcMain.handle('export-images', async (event, exportSettings) => {
    try {
        // Ask user to select output directory
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Select Export Directory'
        });

        if (canceled || filePaths.length === 0) {
            return { success: false, error: 'No directory selected' };
        }

        const outputDir = filePaths[0];
        const { watermark, naming, files } = exportSettings;
        const rgb = hexToRgb(watermark.color);

        let processedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const inputPath = files[i];
            const fileName = path.basename(inputPath);
            const ext = path.extname(fileName);
            const nameWithoutExt = path.basename(fileName, ext);

            // Apply naming rules
            const newFileName = `${naming.prefix}${nameWithoutExt}${naming.suffix}${ext}`;
            const outputPath = path.join(outputDir, newFileName);

            // Load image to get dimensions
            const image = sharp(inputPath);
            const metadata = await image.metadata();

            // Calculate text dimensions (approximate based on font size)
            const textWidth = watermark.text.length * watermark.size * 0.6;
            const textHeight = watermark.size * 1.2;

            // Calculate watermark position
            const position = calculateWatermarkPosition(
                metadata.width,
                metadata.height,
                textWidth,
                textHeight,
                watermark.position
            );

            // Create SVG text overlay
            const svgText = `
                <svg width="${metadata.width}" height="${metadata.height}">
                    <text
                        x="${position.x}"
                        y="${position.y + watermark.size}"
                        font-size="${watermark.size}"
                        fill="rgb(${rgb.r},${rgb.g},${rgb.b})"
                        fill-opacity="${watermark.opacity}"
                        font-family="Arial, sans-serif"
                    >${watermark.text}</text>
                </svg>
            `;

            // Process image with watermark
            await sharp(inputPath)
                .composite([{
                    input: Buffer.from(svgText),
                    top: 0,
                    left: 0
                }])
                .toFile(outputPath);

            processedCount++;

            // Send progress update
            event.sender.send('export-progress', {
                current: processedCount,
                total: files.length
            });
        }

        return { success: true, count: processedCount };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
    }
});
