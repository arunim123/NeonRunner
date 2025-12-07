
import React, { useEffect } from 'react';
import { startMusic, stopMusic, setMute } from '../services/audioService';

export const MusicPlayer: React.FC<{ volume: number, active: boolean }> = ({ volume, active }) => {
  useEffect(() => {
    // We treat volume < 0.1 as mute for this simple implementation
    setMute(volume < 0.1);
  }, [volume]);

  useEffect(() => {
    if (active) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [active]);

  return null;
};
