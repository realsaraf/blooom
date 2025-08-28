# Blooom - Screen Recording App

A sleek, cross-platform screen recording application built with Electron, React, and TypeScript.

<img width="422" height="723" alt="image" src="https://github.com/user-attachments/assets/0c9d26f3-1ef6-47de-a56e-fce79e8eedb0" />

## Features

- 🎥 **Screen & Window Recording**: Record entire screens or specific application windows
- 🔊 **System Audio Recording**: Capture system audio along with video
- 🎤 **Microphone Support**: Optional microphone recording with system audio mixing
- ⏸️ **Pause/Resume**: Pause and resume recordings as needed
- 🛑 **Stop & Save**: Stop recording and automatically save to your chosen location
- 📁 **Custom Output Directory**: Choose where to save your recordings
- 🔧 **Audio Controls**: Independent mute controls for microphone and system audio
- 🎨 **Sleek UI**: Modern, dark-themed interface
- 💾 **Auto-Save**: Automatic saving with timestamped filenames
- 📂 **Quick Access**: One-click access to saved recording location

## System Requirements

- **Windows**: Windows 10/11 (x64)
- **macOS**: macOS 10.14+ (Intel & Apple Silicon)

## Installation

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd blooom
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Create distribution packages**:
   
   For Windows:
   ```bash
   npm run dist:win
   ```
   
   For macOS:
   ```bash
   npm run dist:mac
   ```
   
   For both platforms:
   ```bash
   npm run dist
   ```

The built applications will be available in the `release` folder.

## Usage

1. **Launch Blooom** - The app will open with a clean, intuitive interface

2. **Select Recording Source** - Choose from available screens or application windows

3. **Configure Audio Settings**:
   - Toggle microphone recording on/off
   - Toggle system audio recording on/off

4. **Choose Output Location** - Click "Browse" to select where recordings will be saved

5. **Start Recording** - Click the "Start Recording" button to begin

6. **Control Recording**:
   - **Pause**: Temporarily pause the recording
   - **Resume**: Continue a paused recording
   - **Stop & Save**: End recording and save the file

7. **Access Recordings** - Click the link icon in the success message to open the file location

## Technical Details

### Architecture
- **Frontend**: React 18 with TypeScript
- **Backend**: Electron main process
- **Build System**: Webpack for renderer, TypeScript compiler for main process
- **Recording**: WebRTC MediaRecorder API with desktop capture
- **Audio Mixing**: Web Audio API for combining system and microphone audio

### File Formats
- **Video**: WebM container with VP9 video codec
- **Audio**: Opus audio codec
- **Output**: `.webm` files with timestamp-based naming

### Configuration Storage
- Settings are automatically saved using `electron-store`
- Persistent storage for:
  - Output directory preference
  - Audio settings (mic/system audio mute state)
  - Window position and size
  - Recording quality preferences

## Permissions

### Windows
- **Screen Recording**: Windows will prompt for permission to record screen content
- **Microphone**: Permission required for microphone access (if enabled)

### macOS
- **Screen Recording**: Must be granted in System Preferences > Security & Privacy > Privacy > Screen Recording
- **Microphone**: Permission required in System Preferences > Security & Privacy > Privacy > Microphone

## Troubleshooting

### Common Issues

**"Failed to start recording"**
- Ensure you've granted necessary screen recording permissions
- Try selecting a different screen or window source
- Restart the application if permissions were just granted

**No audio in recordings**
- Check that system audio is not muted in Blooom settings
- Verify system audio is playing from other applications
- On macOS, ensure the application has microphone permissions even for system audio

**Recordings not saving**
- Verify the selected output directory exists and is writable
- Ensure sufficient disk space is available
- Try selecting a different output directory

### Performance Tips
- Close unnecessary applications to improve recording performance
- Use lower resolution sources for smaller file sizes
- Ensure adequate disk space for long recordings

## Development

### Project Structure
```
src/
├── main/           # Electron main process
│   ├── main.ts     # Application entry point
│   └── preload.ts  # Preload script for secure IPC
└── renderer/       # React frontend
    ├── App.tsx     # Main application component
    ├── index.tsx   # React entry point
    ├── styles.css  # Application styles
    └── types.ts    # TypeScript type definitions
```

### Available Scripts
- `npm run dev` - Start development with hot reload
- `npm run build` - Build for production
- `npm run start` - Start built application
- `npm run dist` - Create distribution packages
- `npm run dist:win` - Windows-only distribution
- `npm run dist:mac` - macOS-only distribution

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions, please create an issue in the project repository.
