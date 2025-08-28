import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  getSources: () => Promise<Array<{
    id: string;
    name: string;
    thumbnail: string;
  }>>;
  getConfig: () => Promise<{
    outputDirectory: string;
    defaultQuality: string;
    muteMicrophone: boolean;
    muteSystemAudio: boolean;
  }>;
  updateConfig: (config: any) => Promise<any>;
  selectOutputDirectory: () => Promise<string | null>;
  saveRecording: (buffer: ArrayBuffer, filename: string) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  openFileLocation: (filePath: string) => Promise<void>;
  createRecordingOverlay: (bounds: { x: number; y: number; width: number; height: number }) => Promise<void>;
  closeRecordingOverlay: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  getAppVersion: () => Promise<string>;
}

const electronAPI: ElectronAPI = {
  getSources: () => ipcRenderer.invoke('get-sources'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config) => ipcRenderer.invoke('update-config', config),
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
  saveRecording: (buffer, filename) => ipcRenderer.invoke('save-recording', buffer, filename),
  openFileLocation: (filePath) => ipcRenderer.invoke('open-file-location', filePath),
  createRecordingOverlay: (bounds) => ipcRenderer.invoke('create-recording-overlay', bounds),
  closeRecordingOverlay: () => ipcRenderer.invoke('close-recording-overlay'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
