import React from 'react';
import { Play, Trophy, Settings, HelpCircle } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onLeaderboard, onSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent">
      <div className="text-center mb-12 animate-pulse">
        <h1 className="font-display text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 tracking-tighter drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
          NEON RUNNER
        </h1>
        <h2 className="font-display text-2xl md:text-3xl text-cyan-300 mt-4 tracking-widest uppercase opacity-80">
          Motion Edition
        </h2>
      </div>

      <div className="flex flex-col gap-6 w-64 md:w-80">
        <MenuButton onClick={onPlay} icon={<Play size={24} />} label="START RUN" primary />
        <MenuButton onClick={onLeaderboard} icon={<Trophy size={24} />} label="LEADERBOARD" />
        <MenuButton onClick={onSettings} icon={<Settings size={24} />} label="SETTINGS" />
      </div>

      <div className="absolute bottom-8 text-slate-500 text-xs font-mono tracking-widest uppercase">
        POWERED BY GDG ATRIA &bull; TENSORFLOW.JS
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; primary?: boolean }> = ({ 
  onClick, icon, label, primary 
}) => (
  <button 
    onClick={onClick}
    className={`
      group relative flex items-center justify-center gap-3 py-4 px-6
      font-display font-bold text-lg tracking-wider
      border-2 transition-all duration-300 overflow-hidden
      ${primary 
        ? 'border-cyan-400 text-cyan-950 bg-cyan-400 hover:bg-cyan-300 hover:border-cyan-300 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
        : 'border-slate-600 text-slate-300 hover:border-pink-500 hover:text-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-slate-900/50 backdrop-blur-sm'
      }
    `}
  >
    {primary && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />}
    {icon}
    <span>{label}</span>
  </button>
);