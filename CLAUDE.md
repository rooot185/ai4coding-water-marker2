# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Windows desktop watermarking application built with Electron.js. The app allows users to add text watermarks to single or multiple images with real-time preview and customizable positioning, sizing, color, and opacity controls.

## Architecture

### Electron Multi-Process Architecture

This application follows the standard Electron pattern with three main processes:

1. **Main Process** (`main.js`):
   - Creates the BrowserWindow
   - Handles file system operations via IPC (Inter-Process Communication)
   - Manages native dialogs for file/folder selection
   - Supports JPEG, PNG, BMP, TIFF image formats

2. **Preload Script** (`src/preload.js`):
   - Bridges the main and renderer processes securely
   - Uses `contextBridge` to expose a limited `electronAPI` to the renderer
   - Implements three communication patterns: `send` (one-way), `invoke` (two-way), and `on` (listener)

3. **Renderer Process** (`src/renderer.js` + `src/index.html`):
   - Pure browser-side JavaScript handling all UI interactions
   - Manages application state (imported files, watermark settings)
   - Provides real-time watermark preview overlay on images
   - Cannot directly access Node.js/Electron APIs (must use IPC via preload)

### State Management

The renderer uses a simple JavaScript object (`watermarkState`) to track:
- Text content
- Font size
- Opacity (0-1)
- Color (hex value)
- Position (9-grid system: top/center/bottom + left/center/right)

Images are stored in a `Map` data structure (`importedFiles`) keyed by file path.

## Development Commands

**Start the application:**
```bash
npm start
```

This runs `electron .` which launches main.js as the entry point.

**Install dependencies:**
```bash
npm install
```

## Key Implementation Details

### IPC Communication Patterns

When adding new features that require file system or OS-level operations:

1. Define an IPC handler in `main.js`:
   ```javascript
   ipcMain.handle('channel-name', async (event, args) => {
     // Main process logic here
     return result;
   });
   ```

2. Call it from the renderer via the preload bridge:
   ```javascript
   const result = await window.electronAPI.invoke('channel-name', args);
   ```

### Watermark Preview System

The watermark preview works by:
1. Creating/updating a `div.watermark-preview` element absolutely positioned over the image
2. Applying CSS transforms and positioning based on the 9-grid position selection
3. Real-time updates triggered by input event listeners
4. Position calculations in `updateWatermarkPreview()` handle all 9 grid positions with appropriate CSS transforms

### File Import Flows

Three import methods are supported:
1. **Single/Multi-file selector**: Uses `dialog.showOpenDialog` with `multiSelections` property
2. **Folder import**: Reads directory with `fs.readdirSync`, filters by extension
3. **Drag & Drop**: Handled in renderer with `dragover`, `dragleave`, and `drop` events on the preview area

## Current Limitations & Future Work

Based on the PRD (doc/prd.md), the following features are NOT yet implemented:

- Image watermark support (only text watermarks currently work)
- Export functionality (UI exists but no backend implementation)
- Watermark template saving/loading
- JPEG quality adjustment on export
- Image resizing on export
- Drag-to-reposition watermark on preview (only 9-grid positioning works)
- Rotation controls

The current implementation covers Milestone 1 (M1) from the PRD: basic UI, image import, text watermark with position/opacity/color/size controls, and preview functionality.

## Important Notes for Development

- The preload script uses `contextIsolation: true` and `nodeIntegration: false` for security - all Node.js operations must go through IPC
- DevTools can be enabled by uncommenting line 19 in main.js: `mainWindow.webContents.openDevTools()`
- File paths in the renderer are local file paths (e.g., `C:\Users\...`), which can be directly used in `img.src`
- The position grid uses data attributes (`data-position`) for a declarative positioning system
