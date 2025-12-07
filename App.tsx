import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { Leaderboard } from './components/Leaderboard';
import { Calibration } from './components/Calibration';
import { Settings } from './components/Settings';
import { Tutorial } from './components/Tutorial';
import { GameOver } from './components/GameOver';
import { MusicPlayer } from './components/MusicPlayer';
import { loadLeaderboard, saveScore } from './services/scoreService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('MENU');
  const [lastScore, setLastScore] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [calibratedBaseY, setCalibratedBaseY] = useState<number | null>(null);
  
  // Game Settings
  const [volume, setVolume] = useState(0.5);
  const [sensitivity, setSensitivity] = useState(1.0); // Multiplier for movement detection

  const handleStartGame = () => {
    if (calibratedBaseY === null) {
      setView('CALIBRATION');
    } else {
      setView('GAME');
    }
  };

  const handleCalibrationComplete = (baseY: number) => {
    setCalibratedBaseY(baseY);
    setView('TUTORIAL');
  };

  const handleTutorialComplete = () => {
    setView('GAME');
  };

  const handleGameOver = (score: number, distance: number) => {
    setLastScore(score);
    setLastDistance(distance);
    setView('GAMEOVER');
  };

  const handleSaveScore = (name: string) => {
    saveScore({
      name,
      score: lastScore,
      distance: lastDistance,
      date: new Date().toISOString(),
      difficulty
    });
    setView('LEADERBOARD');
  };

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden select-none">
      <div className="absolute inset-0 bg-black z-0" />
      
      {/* Subtle Starfield or Grid could go here, but Canvas now handles the world rendering */}
      
      <div className="relative z-10 w-full h-full">
        {view === 'MENU' && (
          <MainMenu 
            onPlay={handleStartGame}
            onLeaderboard={() => setView('LEADERBOARD')}
            onSettings={() => setView('SETTINGS')}
          />
        )}

        {view === 'SETTINGS' && (
          <Settings 
            volume={volume}
            setVolume={setVolume}
            sensitivity={sensitivity}
            setSensitivity={setSensitivity}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onBack={() => setView('MENU')}
          />
        )}

        {view === 'LEADERBOARD' && (
          <Leaderboard onBack={() => setView('MENU')} />
        )}

        {view === 'CALIBRATION' && (
          <Calibration 
            onComplete={handleCalibrationComplete}
            onCancel={() => setView('MENU')}
          />
        )}

        {view === 'TUTORIAL' && (
          <Tutorial 
            onComplete={handleTutorialComplete}
            calibratedBaseY={calibratedBaseY || 0.5}
            sensitivity={sensitivity}
          />
        )}

        {view === 'GAME' && (
          <GameCanvas 
            difficulty={difficulty}
            sensitivity={sensitivity}
            volume={volume}
            calibratedBaseY={calibratedBaseY || 0.5}
            onGameOver={handleGameOver}
            onPause={() => {}} // Optional: Handle pause UI overlay
          />
        )}

        {view === 'GAMEOVER' && (
          <GameOver 
            score={lastScore} 
            distance={lastDistance}
            onRetry={() => setView('GAME')}
            onMenu={() => setView('MENU')}
            onSave={handleSaveScore}
          />
        )}
      </div>

      <MusicPlayer volume={volume} active={view === 'GAME'} />
    </div>
  );
};

export default App;