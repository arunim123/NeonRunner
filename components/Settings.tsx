import React from 'react';
import { ArrowLeft, Volume2, Activity, Gauge } from 'lucide-react';

interface SettingsProps {
  volume: number;
  setVolume: (v: number) => void;
  sensitivity: number;
  setSensitivity: (s: number) => void;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  setDifficulty: (d: 'EASY' | 'MEDIUM' | 'HARD') => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  volume, setVolume, sensitivity, setSensitivity, difficulty, setDifficulty, onBack
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="hover:text-cyan-400 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-display font-bold">SETTINGS</h2>
        </div>

        <div className="space-y-8">
          {/* Volume */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-300">
              <Volume2 size={18} /> <span className="font-bold">MUSIC VOLUME</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Sensitivity */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-300">
              <Activity size={18} /> <span className="font-bold">MOTION SENSITIVITY</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>RELAXED</span>
              <span>TWITCHY</span>
            </div>
            <input 
              type="range" 
              min="0.5" max="2.0" step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Difficulty */}
          <div>
             <div className="flex items-center gap-2 mb-4 text-slate-300">
              <Gauge size={18} /> <span className="font-bold">DIFFICULTY</span>
            </div>
            <div className="flex gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`
                    flex-1 py-3 font-display font-bold rounded-lg border-2 transition-all
                    ${difficulty === d 
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-500'
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};