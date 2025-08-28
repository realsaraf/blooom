import { app, BrowserWindow, ipcMain, desktopCapturer, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

interface StoreSchema {
  outputDirectory: string;
  defaultQuality: string;
  muteMicrophone: boolean;
  muteSystemAudio: boolean;
  windowBounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

const store = new Store<StoreSchema>({
  defaults: {
    outputDirectory: path.join(app.getPath('videos'), 'Blooom'),
    defaultQuality: 'high',
    muteMicrophone: false,
    muteSystemAudio: false,
    windowBounds: {
      width: 400,
      height: 600,
    },
  },
});

let mainWindow: BrowserWindow | null = null;
let recordingWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  const bounds = store.get('windowBounds');
  
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 350,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Custom frame on Windows/Linux, macOS keeps inset traffic lights
    frame: isMac ? true : false,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    backgroundColor: '#1a1a1a',
    show: false,
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Ensure no legacy menu bar shows on Windows/Linux
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('close', () => {
    if (mainWindow) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createRecordingWindow = (bounds: { x: number; y: number; width: number; height: number }): void => {
  recordingWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    recordingWindow.loadURL('http://localhost:3000#recording-overlay');
  } else {
    recordingWindow.loadFile(path.join(__dirname, 'index.html'), { hash: 'recording-overlay' });
  }

  recordingWindow.on('closed', () => {
    recordingWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 300, height: 200 },
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
    }));
  } catch (error) {
    console.error('Error getting sources:', error);
    return [];
  }
});

ipcMain.handle('get-config', () => {
  return {
    outputDirectory: store.get('outputDirectory'),
    defaultQuality: store.get('defaultQuality'),
    muteMicrophone: store.get('muteMicrophone'),
    muteSystemAudio: store.get('muteSystemAudio'),
  };
});

ipcMain.handle('update-config', (_, config: Partial<StoreSchema>) => {
  Object.keys(config).forEach(key => {
    if (config[key as keyof StoreSchema] !== undefined) {
      store.set(key as keyof StoreSchema, config[key as keyof StoreSchema] as any);
    }
  });
  return store.store;
});

ipcMain.handle('select-output-directory', async () => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: store.get('outputDirectory'),
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedPath = result.filePaths[0];
    store.set('outputDirectory', selectedPath);
    return selectedPath;
  }
  
  return null;
});

ipcMain.handle('save-recording', async (_, buffer: ArrayBuffer, filename: string) => {
  try {
    const outputDir = store.get('outputDirectory');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Error saving recording:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('open-file-location', (_, filePath: string) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle('create-recording-overlay', (_, bounds) => {
  createRecordingWindow(bounds);
});

ipcMain.handle('close-recording-overlay', () => {
  if (recordingWindow) {
    recordingWindow.close();
    recordingWindow = null;
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
