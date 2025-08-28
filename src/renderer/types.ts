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
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
