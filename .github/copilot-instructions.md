# Blooom - GitHub Copilot Instructions

## Project Overview

**Blooom** is a professional cross-platform screen recording application built with **Electron**, **React**, and **TypeScript**. It provides an intuitive interface for recording screens and windows with system audio support, targeting Windows 11 and macOS users.

### Core Purpose
- Screen and window recording with system audio capture
- Pause/resume functionality for recordings
- Custom output directory selection with persistent configuration
- Independent audio controls for microphone and system audio
- Modern, sleek dark-themed user interface

## Architecture & Technology Stack

### Frontend (Renderer Process)
- **React 18** with TypeScript for UI components
- **Lucide React** for consistent iconography
- **CSS3** with modern gradients and transitions
- **Webpack 5** for module bundling and development server

### Backend (Main Process)
- **Electron 25** for cross-platform desktop application
- **Node.js** with TypeScript for main process logic
- **electron-store** for persistent configuration management
- **desktopCapturer API** for screen/window source enumeration

### Build System
- **TypeScript 5.1** with strict configuration
- **Webpack** for renderer process bundling
- **electron-builder** for distribution packaging
- **Concurrently** for parallel development processes

## Project Structure

```
blooom/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts             # Main application logic, window management
│   │   └── preload.ts          # Context bridge for secure IPC
│   └── renderer/               # React frontend
│       ├── App.tsx             # Main application component
│       ├── index.tsx           # React DOM entry point
│       ├── index.html          # HTML template
│       ├── styles.css          # Global styles and theming
│       └── types.ts            # TypeScript type definitions
├── assets/                     # Application assets
├── dist/                       # Compiled output (generated)
├── release/                    # Distribution packages (generated)
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript config for renderer
├── tsconfig.main.json        # TypeScript config for main process
├── webpack.config.js         # Webpack bundling configuration
└── .github/
    └── copilot-instructions.md # This file
```

## Quick Reference - Essential Commands

**⚠️ ALWAYS verify `dist/main.js` exists before running `npm start`**

```bash
# Development (recommended)
npm run dev              # Start development with hot reload

# Building
npm run build           # Build both (safest option)

# Running the app
npm start               # Start Electron (requires complete build)

# Distribution
npm run dist:win        # Create Windows installer
npm run dist:mac        # Create macOS app bundle
```

**🔧 Troubleshooting Build Issues:**
- If `npm start` fails with "main.js not found": Run `npm run build:main`
- If UI changes don't appear: Run `npm run build:renderer`
- If neither works: Run `npm run build` (builds everything)
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript config for renderer
├── tsconfig.main.json        # TypeScript config for main process
├── webpack.config.js         # Webpack bundling configuration
└── .github/
    └── copilot-instructions.md # This file
```

## Key Components & Features

### Main Process (`src/main/main.ts`)
- **Window Management**: Creates and manages main application window and recording overlay
- **Custom Window Frame**: Uses `frame: false` for platform-specific title bars
- **Platform Detection**: Provides OS detection for conditional UI rendering
- **IPC Handlers**: Implements secure communication between main and renderer processes
- **Configuration Storage**: Manages user preferences using electron-store
- **File Operations**: Handles recording file saving and directory selection
- **Desktop Capture**: Interfaces with Electron's desktopCapturer for source enumeration

### Renderer Process (`src/renderer/App.tsx`)
- **Platform-Specific Window Controls**: Custom title bar with traffic lights (macOS) or minimize/close buttons (Windows)
- **Source Selection**: Enhanced dropdown interface for choosing screen/window sources with thumbnails
- **Recording Controls**: Start, pause, resume, and stop recording functionality
- **Audio Management**: Independent controls for microphone and system audio
- **Settings Management**: Configuration UI for output directory and quality settings
- **Real-time Feedback**: Recording timer, status indicators, and success/error messages
- **Glass Morphism UI**: Full-window glass effect with backdrop blur and modern design
- **Responsive Layout**: Organized in distinct rows - source selection top, audio/output controls bottom

### Preload Script (`src/main/preload.ts`)
- **Security Bridge**: Exposes safe APIs to renderer process via contextBridge
- **Type Safety**: Provides strongly-typed IPC method definitions
- **API Abstraction**: Simplifies main process communication for renderer

## Development Guidelines

### Code Style & Patterns
- Use **functional React components** with hooks
- Implement **TypeScript interfaces** for all data structures
- Follow **async/await** patterns for IPC communication
- Use **CSS Grid** and **Flexbox** for responsive layouts
- Apply **BEM-like** CSS class naming conventions

### State Management
- Use React's `useState` and `useEffect` hooks for local state
- Implement proper cleanup in `useEffect` dependencies
- Store user preferences in electron-store for persistence
- Handle loading states and error boundaries appropriately

### IPC Communication
- All main↔renderer communication must go through preload script
- Use `ipcMain.handle()` and `ipcRenderer.invoke()` for async operations
- Implement proper error handling and validation for all IPC calls
- Maintain type safety across process boundaries

### Build & Distribution

**IMPORTANT BUILD NOTES:**
- The project has two separate build processes that must both complete successfully
- Always ensure both `main.js` and `renderer.js` files exist in `dist/` before running `npm start`
- If `main.js` is missing, the app will fail to start with "main.js not found" error

#### Build Scripts Overview
- `npm run dev` - Development with hot reload (runs both main and renderer in watch mode)
- `npm run build:main` - Builds main process (TypeScript: src/main → dist/main.js, dist/preload.js)
- `npm run build:renderer` - Builds renderer process (Webpack: src/renderer → dist/renderer.js + index.html)
- `npm run build` - Builds both processes sequentially (recommended for production)
- `npm start` - Starts Electron app (requires both builds to be complete)

#### Common Build Issues & Solutions

**Issue: "main.js missing" error when running npm start**
- **Cause**: Main process wasn't built properly
- **Solution**: Run `npm run build:main` manually before `npm start`
- **Prevention**: Always use `npm run build` instead of individual build commands

**Issue: build:renderer doesn't create main.js files**
- **Cause**: Sequential command execution issues in npm scripts on Windows
- **Solution**: Run builds separately: `npm run build:main && npm run build:renderer`
- **Alternative**: Use the unified `npm run build` command

#### Recommended Build Workflow

**For Development:**
```bash
npm run dev          # Starts both processes in watch mode
```

**For Testing/Production:**
```bash
npm run build        # Builds both main and renderer
npm start           # Starts the application
```

#### Required Files in dist/ Directory
After successful build, `dist/` should contain:
- `main.js` - Main Electron process (from TypeScript compilation)
- `preload.js` - Preload script for secure IPC (from TypeScript compilation)
- `renderer.js` - React application bundle (from Webpack)
- `index.html` - HTML template (copied by Webpack)
- `renderer.js.map` - Source maps for debugging (development)

#### Build Verification
Always verify successful build by checking:
```bash
ls dist/             # Should show all required files
npm start           # Should start without errors
```

**Distribution Builds:**
- `npm run dist:win` - Creates Windows installer (.exe)
- `npm run dist:mac` - Creates macOS app bundle (.dmg)
- Ensure all dependencies are properly configured in package.json

## Configuration Schema

The application uses electron-store with the following configuration structure:

```typescript
interface StoreSchema {
  outputDirectory: string;        // Where recordings are saved
  defaultQuality: string;         // Recording quality setting
  muteMicrophone: boolean;        // Microphone mute state
  muteSystemAudio: boolean;      // System audio mute state
  windowBounds: {                // Window position and size
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}
```

## Common Development Tasks

### Adding New Features
1. Define TypeScript interfaces in appropriate files
2. Implement IPC handlers in `main.ts` if backend logic needed
3. Add corresponding preload methods for renderer access
4. Update React components with new UI elements
5. Add proper error handling and loading states

### Styling Guidelines
- Use the established color palette: `#1a1a1a`, `#2d2d2d`, `#667eea`, `#764ba2`
- Maintain consistent spacing with 8px base unit
- Apply smooth transitions for interactive elements
- Use semantic color classes for different states (success, error, warning)

### Testing Integration
- Verify cross-platform compatibility (Windows/macOS)
- Test screen recording functionality across different display configurations
- Validate file saving with various path configurations
- Ensure proper cleanup of recording resources

## Performance Considerations

- **Memory Management**: Properly dispose of MediaRecorder instances
- **File Handling**: Stream large recording files to disk efficiently
- **UI Responsiveness**: Use requestAnimationFrame for smooth animations
- **Resource Cleanup**: Clean up event listeners and timeouts in useEffect

## Security Best Practices

- **Context Isolation**: Maintain strict separation between main and renderer processes
- **Input Validation**: Sanitize all user inputs and file paths
- **Permission Handling**: Request necessary system permissions appropriately
- **Secure Defaults**: Use secure default configurations for electron-builder

## Known Limitations & Future Enhancements

### Current Limitations
- Recording overlay positioning may need refinement on multi-monitor setups
- Audio mixing capabilities could be expanded for professional use
- Mobile/touch interface not currently supported

### Enhancement Opportunities
- Add video format selection (MP4, WebM, AVI)
- Implement recording annotations and drawing tools
- Add cloud storage integration options
- Support for scheduled recordings
- Advanced audio filtering and noise reduction

## Debugging & Troubleshooting

### Build-Related Issues

**Critical: Always verify build completeness before starting the app**

**Issue: "main.js not found" when starting Electron**
- **Root Cause**: TypeScript compilation didn't complete or failed silently
- **Solution**: Always run `npm run build:main` before `npm start`
- **Verification**: Check that `dist/main.js` and `dist/preload.js` exist
- **Prevention**: Use `npm run build` which builds both processes

**Issue: npm scripts not executing sequentially on Windows**
- **Symptoms**: `build:renderer` runs TypeScript but doesn't create files
- **Cause**: PowerShell command chaining with `&&` can have timing issues
- **Solutions**:
  1. Run commands separately: `npm run build:main` then `npm run build:renderer:only`
  2. Use the unified `npm run build` command
  3. Verify files exist in `dist/` before proceeding

**Issue: TypeScript compilation appears successful but no output files**
- **Check**: Verify `tsconfig.main.json` has correct `outDir: "dist"`
- **Check**: Ensure no TypeScript errors are preventing emission
- **Debug**: Run `npx tsc --project tsconfig.main.json --listFiles` to see processed files
- **Verify**: Run `ls dist/` after compilation to confirm file creation

### Development Workflow Issues

**Issue: Hot reload not working in development**
- **Solution**: Use `npm run dev` which runs both main and renderer in watch mode
- **Check**: Ensure both processes are running in parallel via concurrently

**Issue: Changes not reflecting after build**
- **Solution**: Clear `dist/` directory and rebuild: `npm run clean && npm run build`
- **Check**: Verify you're editing source files, not compiled files in `dist/`

### Runtime Issues
- **Build Failures**: Check TypeScript configuration and dependency versions
- **IPC Errors**: Verify preload script is properly loaded and methods are exposed
- **Recording Issues**: Ensure proper screen capture permissions on macOS
- **File Save Errors**: Validate output directory permissions and disk space
- **Window Controls**: Verify platform detection works correctly for Windows vs macOS

### Debug Tools
- Use Chrome DevTools for renderer process debugging
- Enable Electron's built-in debugging for main process
- Check electron-builder logs for distribution issues
- Monitor system permissions for screen capture access
- Use `npm run build:main -- --listFiles` to debug TypeScript compilation
- Check console for IPC communication errors between main and renderer processes

## Dependencies & Maintenance

### Critical Dependencies
- **electron**: Core framework - monitor for security updates
- **react/react-dom**: UI framework - keep stable version
- **typescript**: Type checking - update carefully for breaking changes
- **electron-builder**: Distribution - ensure compatibility with target platforms

### Update Strategy
- Test all updates in development environment first
- Verify cross-platform compatibility after major updates
- Maintain backward compatibility for user configuration files
- Document any breaking changes in release notes

---

This comprehensive instruction set should help GitHub Copilot understand the project structure, coding patterns, and development practices specific to the Blooom screen recording application.
