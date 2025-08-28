import React, { useState, useEffect, useRef } from 'react';
import './types';
import { 
  Monitor, 
  Square, 
  Circle, 
  Pause, 
  StopCircle, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  FolderOpen,
  Download,
  Minimize2,
  ExternalLink
} from 'lucide-react';

interface Source {
  id: string;
  name: string;
  thumbnail: string;
}

interface Config {
  outputDirectory: string;
  defaultQuality: string;
  muteMicrophone: boolean;
  muteSystemAudio: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused';

const App: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [config, setConfig] = useState<Config>({
    outputDirectory: '',
    defaultQuality: 'high',
    muteMicrophone: false,
    muteSystemAudio: false,
  });
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [savedFilePath, setSavedFilePath] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadSources();
    loadConfig();
    loadAppVersion();
  }, []);

  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  const loadSources = async () => {
    try {
      const sources = await window.electronAPI.getSources();
      setSources(sources);
      if (sources.length > 0) {
        setSelectedSource(sources[0]);
      }
    } catch (err) {
      setError('Failed to load screen sources');
    }
  };

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getConfig();
      setConfig(config);
    } catch (err) {
      setError('Failed to load configuration');
    }
  };

  const loadAppVersion = async () => {
    try {
      const version = await window.electronAPI.getAppVersion();
      setAppVersion(version);
    } catch (err) {
      console.error('Failed to load app version');
    }
  };

  const updateConfig = async (updates: Partial<Config>) => {
    try {
      const newConfig = await window.electronAPI.updateConfig(updates);
      setConfig(newConfig);
    } catch (err) {
      setError('Failed to update configuration');
    }
  };

  const selectOutputDirectory = async () => {
    try {
      const directory = await window.electronAPI.selectOutputDirectory();
      if (directory) {
        setConfig(prev => ({ ...prev, outputDirectory: directory }));
      }
    } catch (err) {
      setError('Failed to select output directory');
    }
  };

  const startRecording = async () => {
    if (!selectedSource) {
      setError('Please select a screen or window to record');
      return;
    }

    try {
      setError('');
      setSuccess('');

      // Get the media stream
      const constraints: any = {
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
            minWidth: 1280,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080,
          }
        }
      };

      // Apply audio settings
      if (config.muteSystemAudio) {
        delete constraints.audio;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Add microphone if not muted
      if (!config.muteMicrophone) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true 
          });
          
          // Combine streams
          const audioContext = new AudioContext();
          const dest = audioContext.createMediaStreamDestination();
          
          if (stream.getAudioTracks().length > 0) {
            const systemAudioSource = audioContext.createMediaStreamSource(
              new MediaStream(stream.getAudioTracks())
            );
            systemAudioSource.connect(dest);
          }
          
          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(dest);
          
          // Replace audio track
          stream.getAudioTracks().forEach(track => stream.removeTrack(track));
          dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
        } catch (micError) {
          console.warn('Could not access microphone:', micError);
        }
      }

      // Create MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const buffer = await blob.arrayBuffer();
        const filename = `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
        
        try {
          const result = await window.electronAPI.saveRecording(buffer, filename);
          if (result.success && result.filePath) {
            setSuccess('Recording saved successfully!');
            setSavedFilePath(result.filePath);
          } else {
            setError(result.error || 'Failed to save recording');
          }
        } catch (saveError) {
          setError('Failed to save recording');
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setRecordingState('idle');
        setRecordingTime(0);
        await window.electronAPI.closeRecordingOverlay();
      };

      mediaRecorder.start(1000); // Capture data every second
      setRecordingState('recording');
      
      // Minimize main window and show recording overlay
      await window.electronAPI.minimizeWindow();
      
    } catch (err) {
      setError('Failed to start recording. Please make sure you have the necessary permissions.');
      console.error('Recording error:', err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openFileLocation = () => {
    if (savedFilePath) {
      window.electronAPI.openFileLocation(savedFilePath);
    }
  };

  const isRecording = recordingState !== 'idle';

  // Check if we're in the recording overlay mode
  if (window.location.hash === '#recording-overlay') {
    return <div className="recording-overlay"></div>;
  }

  return (
    <div className="app">
      <div className="title-bar">
        <span className="title-text">Blooom</span>
      </div>
      
      <div className="content">
        <div className="header">
          <div className="logo">Blooom</div>
          <div className="subtitle">Screen Recording Made Simple</div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>{success}</span>
            {savedFilePath && (
              <div className="message-actions">
                <button 
                  className="link-button"
                  onClick={openFileLocation}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {isRecording && (
          <div className="recording-status">
            <div className="recording-dot"></div>
            <span>Recording: {formatTime(recordingTime)}</span>
          </div>
        )}

        <div className="section">
          <div className="section-title">
            <Monitor size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Select Screen or Window
          </div>
          <div className="sources-grid">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`source-item ${selectedSource?.id === source.id ? 'selected' : ''}`}
                onClick={() => !isRecording && setSelectedSource(source)}
              >
                <img 
                  src={source.thumbnail} 
                  alt={source.name}
                  className="source-thumbnail"
                />
                <div className="source-name">{source.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            <Settings size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Recording Settings
          </div>
          
          <div className="controls">
            <div className="control-group">
              <div className="control-label">
                {config.muteMicrophone ? <MicOff size={16} /> : <Mic size={16} />}
                Microphone
              </div>
              <div 
                className={`toggle-switch ${!config.muteMicrophone ? 'active' : ''}`}
                onClick={() => !isRecording && updateConfig({ muteMicrophone: !config.muteMicrophone })}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>

            <div className="control-group">
              <div className="control-label">
                {config.muteSystemAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
                System Audio
              </div>
              <div 
                className={`toggle-switch ${!config.muteSystemAudio ? 'active' : ''}`}
                onClick={() => !isRecording && updateConfig({ muteSystemAudio: !config.muteSystemAudio })}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            <FolderOpen size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Output Location
          </div>
          <div className="path-selector">
            <input 
              type="text" 
              value={config.outputDirectory} 
              readOnly 
              className="path-input"
              placeholder="Select output directory..."
            />
            <button 
              className="btn btn-secondary"
              onClick={selectOutputDirectory}
              disabled={isRecording}
            >
              Browse
            </button>
          </div>
        </div>

        {!isRecording ? (
          <button 
            className="btn btn-primary record-button"
            onClick={startRecording}
            disabled={!selectedSource}
          >
            <Circle size={20} />
            Start Recording
          </button>
        ) : (
          <div className="recording-controls">
            {recordingState === 'recording' ? (
              <button 
                className="btn btn-secondary"
                onClick={pauseRecording}
              >
                <Pause size={16} />
                Pause
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={resumeRecording}
              >
                <Circle size={16} />
                Resume
              </button>
            )}
            <button 
              className="btn btn-danger"
              onClick={stopRecording}
            >
              <StopCircle size={16} />
              Stop & Save
            </button>
          </div>
        )}
      </div>

      <div className="status-bar">
        <span>Blooom v{appVersion}</span>
        {isRecording && (
          <span className="recording-timer">
            ● REC {formatTime(recordingTime)}
          </span>
        )}
      </div>
    </div>
  );
};

export default App;
