import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc';
import { startSyncScheduler, stopSyncScheduler } from '../sync/scheduler';
import { getServerUrl } from '../sync/connection';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'نظام إدارة الصيدليات',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function processSyncItem(item: { id: string; payload: string }): Promise<boolean> {
  const serverUrl = getServerUrl();
  let payloadObj: Record<string, unknown>;
  try {
    payloadObj = JSON.parse(item.payload);
  } catch {
    return false;
  }

  const res = await fetch(`${serverUrl}/api/sync/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: 'local', payload: payloadObj }),
  });
  return res.ok;
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
  startSyncScheduler(processSyncItem);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopSyncScheduler();
});
