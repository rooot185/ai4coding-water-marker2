document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const importBtn = document.getElementById('import-btn');
    const importFolderBtn = document.getElementById('import-folder-btn');
    const imageList = document.getElementById('image-list');
    const previewArea = document.getElementById('preview-area');

    // Watermark Controls
    const wmTextInput = document.getElementById('wm-text');
    const wmSizeInput = document.getElementById('wm-size');
    const wmOpacityInput = document.getElementById('wm-opacity');
    const wmColorInput = document.getElementById('wm-color');
    const positionGrid = document.querySelector('.position-grid');

    // Export Controls
    const exportBtn = document.getElementById('export-btn');
    const namePrefixInput = document.getElementById('name-prefix');
    const nameSuffixInput = document.getElementById('name-suffix');
    const progressContainer = document.getElementById('progress-container');
    const progressBarInner = document.getElementById('progress-bar-inner');
    const progressLabel = document.getElementById('progress-label');

    // --- State Management ---
    const importedFiles = new Map(); // Using Map to store file path and metadata
    let selectedFilePath = null;
    const watermarkState = {
        text: 'Watermark',
        size: 48,
        opacity: 0.5,
        color: '#FFFFFF',
        position: 'center'
    };

    // --- Functions ---

    // Update watermark preview based on current state
    const updateWatermarkPreview = () => {
        let watermarkEl = previewArea.querySelector('.watermark-preview');
        if (!watermarkEl) {
            watermarkEl = document.createElement('div');
            watermarkEl.className = 'watermark-preview';
            previewArea.appendChild(watermarkEl);
        }

        watermarkEl.textContent = watermarkState.text;
        watermarkEl.style.fontSize = `${watermarkState.size}px`;
        watermarkEl.style.color = watermarkState.color;
        watermarkEl.style.opacity = watermarkState.opacity;

        // Reset position styles
        watermarkEl.style.top = watermarkEl.style.bottom = watermarkEl.style.left = watermarkEl.style.right = 'auto';
        watermarkEl.style.transform = 'translate(-50%, -50%)'; // Center transform default

        // Apply position styles
        const [y, x] = watermarkState.position.split('-');
        switch (y) {
            case 'top': watermarkEl.style.top = '5%'; watermarkEl.style.transform = 'translateX(-50%)'; break;
            case 'bottom': watermarkEl.style.bottom = '5%'; watermarkEl.style.transform = 'translateX(-50%)'; break;
            default: watermarkEl.style.top = '50%'; break; // Center
        }
        switch (x) {
            case 'left': watermarkEl.style.left = '5%'; watermarkEl.style.transform = y === 'center' ? 'translateY(-50%)' : ''; break;
            case 'right': watermarkEl.style.right = '5%'; watermarkEl.style.transform = y === 'center' ? 'translateY(-50%)' : ''; break;
            default: watermarkEl.style.left = '50%'; break; // Center
        }
        if (watermarkState.position === 'center') {
             watermarkEl.style.transform = 'translate(-50%, -50%)';
        } else if (y !== 'center' && x !== 'center') {
            const transformX = x === 'left' ? '0' : '-100%';
            const transformY = y === 'top' ? '0' : '-100%';
            watermarkEl.style.transform = `translate(${transformX}, ${transformY})`;
            if(y === 'top' && x === 'left') {watermarkEl.style.top = '5%'; watermarkEl.style.left = '5%';}
            if(y === 'top' && x === 'right') {watermarkEl.style.top = '5%'; watermarkEl.style.right = '5%'; watermarkEl.style.left = 'auto';}
            if(y === 'bottom' && x === 'left') {watermarkEl.style.bottom = '5%'; watermarkEl.style.left = '5%'; watermarkEl.style.top = 'auto';}
            if(y === 'bottom' && x === 'right') {watermarkEl.style.bottom = '5%'; watermarkEl.style.right = '5%'; watermarkEl.style.left = 'auto'; watermarkEl.style.top = 'auto';}
        }
    };
    
    // Display an image in the preview area
    const showImageInPreview = (filePath) => {
        selectedFilePath = filePath;
        previewArea.innerHTML = ''; // Clear previous content
        
        const img = document.createElement('img');
        img.src = filePath;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        
        previewArea.appendChild(img);
        updateWatermarkPreview();

        // Update selected item in the list
        document.querySelectorAll('#image-list li').forEach(li => {
            li.classList.toggle('selected', li.dataset.filePath === filePath);
        });
    };

    // Add imported files to the list
    const addFilesToList = (files) => {
        files.forEach(filePath => {
            if (importedFiles.has(filePath)) return;

            importedFiles.set(filePath, {}); // Store file path

            const listItem = document.createElement('li');
            listItem.dataset.filePath = filePath;
            
            const itemContainer = document.createElement('div');
            itemContainer.className = 'list-item-container';

            const img = document.createElement('img');
            img.src = filePath;
            img.className = 'thumbnail';

            const fileName = document.createElement('span');
            fileName.textContent = filePath.split(/[\\/]/).pop();
            
            itemContainer.appendChild(img);
            itemContainer.appendChild(fileName);
            listItem.appendChild(itemContainer);
            
            listItem.addEventListener('click', () => showImageInPreview(filePath));
            imageList.appendChild(listItem);
        });

        if (importedFiles.size > 0 && !selectedFilePath) {
            showImageInPreview(imageList.children[0].dataset.filePath);
        }
    };

    // --- Event Listeners ---

    // File Import
    importBtn.addEventListener('click', async () => addFilesToList(await window.electronAPI.invoke('import-images')));
    importFolderBtn.addEventListener('click', async () => addFilesToList(await window.electronAPI.invoke('import-folder')));

    // Drag and Drop
    previewArea.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); previewArea.classList.add('dragover'); });
    previewArea.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); previewArea.classList.remove('dragover'); });
    previewArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        previewArea.classList.remove('dragover');
        const imageFiles = [...e.dataTransfer.files]
            .map(f => f.path)
            .filter(file => /\.(jpe?g|png|bmp|tiff)$/i.test(file));
        addFilesToList(imageFiles);
    });

    // Watermark Control Listeners
    wmTextInput.addEventListener('input', (e) => { watermarkState.text = e.target.value; updateWatermarkPreview(); });
    wmSizeInput.addEventListener('input', (e) => { watermarkState.size = e.target.value; updateWatermarkPreview(); });
    wmOpacityInput.addEventListener('input', (e) => { watermarkState.opacity = e.target.value; updateWatermarkPreview(); });
    wmColorInput.addEventListener('input', (e) => { watermarkState.color = e.target.value; updateWatermarkPreview(); });
    
    positionGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('pos-btn')) {
            watermarkState.position = e.target.dataset.position;
            document.querySelectorAll('.pos-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateWatermarkPreview();
        }
    });

    // Export Button Listener
    exportBtn.addEventListener('click', async () => {
        if (importedFiles.size === 0) {
            alert('Please import images first!');
            return;
        }

        if (!watermarkState.text || watermarkState.text.trim() === '') {
            alert('Please enter watermark text!');
            return;
        }

        // Collect export settings
        const exportSettings = {
            watermark: {
                text: watermarkState.text,
                size: watermarkState.size,
                opacity: watermarkState.opacity,
                color: watermarkState.color,
                position: watermarkState.position
            },
            naming: {
                prefix: namePrefixInput.value || '',
                suffix: nameSuffixInput.value || ''
            },
            files: Array.from(importedFiles.keys())
        };

        // Show progress container
        progressContainer.style.display = 'block';
        progressBarInner.style.width = '0%';
        progressLabel.textContent = 'Exporting...';
        exportBtn.disabled = true;

        try {
            const result = await window.electronAPI.invoke('export-images', exportSettings);

            if (result.success) {
                progressBarInner.style.width = '100%';
                progressLabel.textContent = `Successfully exported ${result.count} images!`;
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 3000);
            } else {
                progressLabel.textContent = `Export failed: ${result.error}`;
            }
        } catch (error) {
            progressLabel.textContent = `Export error: ${error.message}`;
        } finally {
            exportBtn.disabled = false;
        }
    });

    // Listen for progress updates from main process
    window.electronAPI.on('export-progress', (data) => {
        const percentage = (data.current / data.total) * 100;
        progressBarInner.style.width = `${percentage}%`;
        progressLabel.textContent = `Exporting ${data.current} of ${data.total}...`;
    });

    // --- Initial Setup ---
    wmTextInput.value = watermarkState.text;
    document.querySelector('.pos-btn[data-position="center"]').classList.add('active');
});
