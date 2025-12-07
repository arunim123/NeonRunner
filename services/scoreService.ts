import { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'neon_runner_leaderboard_v1';

export const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load leaderboard", e);
    return [];
  }
};

export const saveScore = (entry: LeaderboardEntry) => {
  const current = loadLeaderboard();
  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Keep top 10
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getBestScore = (): number => {
  const lb = loadLeaderboard();
  return lb.length > 0 ? lb[0].score : 0;
};