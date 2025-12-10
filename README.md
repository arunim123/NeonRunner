# 🎮 Neon Runner: Motion Edition

A motion-controlled infinite runner game built with React, TypeScript, and Webcam-based pose detection. Use your body movements to jump and duck through obstacles in this neon-themed arcade experience! 

## 📋 Overview

Neon Runner is an engaging browser-based game where players control a character using real-time pose detection from their webcam. The game features:

- **Motion Controls**: Jump and duck using body movements detected through your webcam
- **Progressive Difficulty**: Three difficulty levels (Easy, Medium, Hard)
- **Power-ups**: Shield, Score Multiplier, and Slow-Motion effects
- **Leaderboard System**: Track top scores locally
- **Sound Design**: Background music and sound effects
- **Calibration & Tutorial**: Guided setup for optimal gameplay

## 📸 Screenshots

<div align="center">
  <img src="snapshot/Screenshot 2025-12-07 164027.png" alt="Main Menu" width="400" />
  <img src="snapshot/Screenshot 2025-12-07 164117.png" alt="Calibration Screen" width="400" />
</div>

<div align="center">
  <img src="snapshot/Screenshot 2025-12-07 164142.png" alt="Tutorial" width="400" />
  <img src="snapshot/Screenshot 2025-12-07 164204.png" alt="Gameplay" width="400" />
</div>

<div align="center">
  <img src="snapshot/Screenshot 2025-12-07 164213.png" alt="Game Over Screen" width="400" />
  <img src="snapshot/Screenshot 2025-12-07 164225.png" alt="Leaderboard" width="400" />
</div>

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- A webcam
- Modern browser with WebGL support

### Installation

1. **Clone or download the project**
   ```bash
   cd neon-runner_-motion-edition
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

## 🎮 How to Play

### Controls
- **Jump**: Raise your hands above your shoulders
- **Duck**: Bend your knees and lower your body
- **Pause/Menu**: Press ESC or use the menu button

### Game Flow
1. **Calibration**: Set your base position for accurate motion detection
2. **Tutorial**: Learn the controls in a safe environment
3. **Game**: Survive as long as possible, avoiding obstacles and collecting power-ups
4. **Leaderboard**: Submit your score and view top scores

### Difficulty Levels
- **Easy**: Slower obstacles, fewer spawns
- **Medium**: Balanced gameplay
- **Hard**: Fast-paced action with frequent obstacles

### Power-ups
- 🛡️ **Shield**: Protect yourself from one hit
- ⚡ **Score Multiplier**: Double your score for 8 seconds
- 🐢 **Slow-Mo**: Slow down the game for 8 seconds

## 📁 Project Structure

```
neon-runner_-motion-edition/
├── components/
│   ├── Calibration.tsx      # Motion calibration screen
│   ├── GameCanvas.tsx        # Main game rendering
│   ├── GameOver.tsx          # Game end screen with score submission
│   ├── Leaderboard.tsx       # Top scores display
│   ├── MainMenu.tsx          # Game start menu
│   ├── MusicPlayer.tsx       # Audio control component
│   ├── Settings.tsx          # Game settings (volume, sensitivity)
│   └── Tutorial.tsx          # Controls tutorial
├── services/
│   ├── audioService.ts       # Audio playback management
│   ├── scoreService.ts       # Leaderboard persistence (localStorage)
│   └── webcamService.ts      # Pose detection using TensorFlow.js
├── App.tsx                   # Main application component
├── types.ts                  # TypeScript type definitions
├── constants.ts              # Game constants and configuration
├── index.tsx                 # React entry point
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Motion Detection**: TensorFlow.js + MoveNet
- **Webcam**: react-webcam
- **UI Icons**: lucide-react
- **Styling**: CSS (included in components)

## 📦 Key Dependencies

- `react`: UI framework
- `react-dom`: React rendering
- `react-webcam`: Webcam access
- `lucide-react`: Icon components
- **External (loaded via CDN in index.html)**:
  - TensorFlow.js
  - TensorFlow.js pose-detection

## 🎨 Visual Design

The game features a vibrant neon aesthetic with:
- Neon cyan, pink, yellow, green, red, orange, and purple colors
- Dark background (#050505) for contrast
- Smooth animations and particle effects
- Screen shake effects on collisions

## 🎯 Core Game Mechanics

### Movement Detection
- Uses MoveNet pose detection to track body keypoints
- Detects jumps based on vertical hand/body movement
- Detects ducks based on knee bending
- Configurable sensitivity settings

### Game Physics
- Gravity: 0.8 px/frame²
- Jump force: -16 px/frame
- Progressive speed increase: +0.005 per frame
- Speed range: 8-25 px/frame

### Obstacle Generation
- Ground spikes and aerial drones
- Spawn rate: 60-120 frames between obstacles
- Varies by difficulty level

## ⚙️ Configuration

Edit `constants.ts` to adjust:
- Game gravity and jump force
- Movement thresholds for detection
- Spawn rates and game speeds
- Power-up duration
- Colors and visual settings

## 📊 Leaderboard

Scores are saved locally in browser localStorage:
- Stores player name, score, distance traveled, and timestamp
- View top scores in the Leaderboard view
- Persists across browser sessions

## 🔊 Audio

The game includes:
- Background music during gameplay
- Sound effects for jumps, collisions, and power-ups
- Volume control in Settings (0-100%)

## 🎮 Settings

Customize your experience:
- **Volume**: Adjust music and sound effect volume
- **Sensitivity**: Fine-tune motion detection sensitivity (0.5-2.0x)

## 📱 Browser Compatibility

Works best on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

Requires:
- WebGL support
- Webcam permissions
- JavaScript enabled

## 🚀 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
Output files will be in the `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## 🐛 Troubleshooting

### Webcam not detected
- Check browser permissions
- Ensure camera is not in use by other applications
- Try a different browser

### Motion not working
- Complete calibration properly
- Ensure good lighting
- Adjust sensitivity in Settings
- Move slower and more deliberate motions

### Low frame rate
- Close other applications
- Check browser console for errors
- Reduce other active browser tabs

## 📝 License

This project is provided as-is for educational and entertainment purposes.

## 🤝 Contributing

Feel free to fork, modify, and extend this project for your own use!

## 📧 Support

For issues or questions, check the browser console for error messages and ensure all prerequisites are installed correctly.

---

**Enjoy the neon lights and stay reactive!** 🎮✨
