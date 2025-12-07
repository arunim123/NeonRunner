import React, { useState } from 'react';
import { RotateCcw, Home, Save } from 'lucide-react';

interface GameOverProps {
  score: number;
  distance: number;
  onRetry: () => void;
  onMenu: () => void;
  onSave: (name: string) => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, distance, onRetry, onMenu, onSave }) => {
  const [name, setName] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-red-900/20 backdrop-blur-md">
      <div className="text-center animate-bounce mb-8">
        <h1 className="text-6xl md:text-8xl font-black font-display text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">
          CRASHED!
        </h1>
      </div>

      <div className="bg-slate-900/90 p-8 rounded-2xl border border-red-500/50 shadow-2xl flex flex-col items-center gap-6 w-full max-w-md">
        <div className="text-center w-full">
          <div className="text-slate-400 font-mono text-sm mb-1">FINAL SCORE</div>
          <div className="text-5xl font-bold text-white mb-4">{score.toLocaleString()}</div>
          
          <div className="grid grid-cols-2 gap-4 w-full bg-slate-800/50 p-4 rounded-lg mb-6">
            <div>
              <div className="text-xs text-slate-500 font-bold">DISTANCE</div>
              <div className="text-xl text-cyan-400 font-mono">{distance}m</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold">RANK</div>
              <div className="text-xl text-yellow-400 font-mono">--</div>
            </div>
          </div>

          <div className="flex gap-2 w-full mb-6">
            <input 
              type="text" 
              placeholder="ENTER INITIALS"
              maxLength={3}
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-cyan-500 uppercase"
            />
            <button 
              onClick={() => name && onSave(name)}
              disabled={!name}
              className="bg-cyan-600 disabled:opacity-50 hover:bg-cyan-500 text-white p-3 rounded-lg font-bold transition-colors"
            >
              <Save size={24} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black font-bold font-display hover:scale-105 transition-transform rounded-lg"
          >
            <RotateCcw size={20} /> RETRY
          </button>
          <button 
            onClick={onMenu}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-800 text-white font-bold font-display hover:bg-slate-700 transition-colors rounded-lg border border-slate-600"
          >
            <Home size={20} /> MENU
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-slate-500 text-xs font-mono tracking-widest uppercase">
        POWERED BY GDG ATRIA
      </div>
    </div>
  );
};