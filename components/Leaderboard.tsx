import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { loadLeaderboard } from '../services/scoreService';
import { LeaderboardEntry } from '../types';

export const Leaderboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setScores(loadLeaderboard());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-4">
            <Trophy className="text-yellow-400" size={32} />
            <h2 className="text-3xl font-display font-bold text-white">TOP RUNNERS</h2>
          </div>
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 text-sm font-mono uppercase tracking-wider">
                <th className="pb-4 pl-4">Rank</th>
                <th className="pb-4">Name</th>
                <th className="pb-4">Score</th>
                <th className="pb-4">Distance</th>
                <th className="pb-4 text-right pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 italic">No records yet. Be the first!</td>
                </tr>
              ) : (
                scores.map((entry, idx) => (
                  <tr key={idx} className="group hover:bg-white/5 transition-colors border-b border-slate-800/50">
                    <td className="py-4 pl-4 font-mono text-cyan-500 font-bold">#{idx + 1}</td>
                    <td className="py-4 font-bold text-white">{entry.name}</td>
                    <td className="py-4 font-mono text-yellow-400">{entry.score.toLocaleString()}</td>
                    <td className="py-4 text-slate-400">{entry.distance}m</td>
                    <td className="py-4 text-right pr-4 text-xs text-slate-500 font-mono">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};