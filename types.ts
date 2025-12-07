
export type ViewState = 'MENU' | 'GAME' | 'GAMEOVER' | 'LEADERBOARD' | 'SETTINGS' | 'CALIBRATION' | 'TUTORIAL';

export type PoseAction = 'IDLE' | 'JUMP' | 'DUCK';

export interface PlayerState {
  y: number; // Vertical position relative to ground (0)
  vy: number;
  isJumping: boolean;
  isDucking: boolean;
  width: number;
  height: number;
  color: string;
  rotation: number; // For animation
}

export interface Entity2D {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Obstacle extends Entity2D {
  type: 'GROUND_SPIKE' | 'AERIAL_DRONE';
  passed: boolean;
}

export interface PowerUp extends Entity2D {
  type: 'SHIELD' | 'MULTIPLIER' | 'SLOW_MO';
  active: boolean;
}

export interface ActivePowerUp {
  type: 'SHIELD' | 'MULTIPLIER' | 'SLOW_MO';
  endTime: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  distance: number;
  date: string;
  difficulty: string;
}

export interface ParallaxLayer {
  speedModifier: number;
  points: {x: number, y: number}[]; // Polygon points for mountains
  color: string;
}
