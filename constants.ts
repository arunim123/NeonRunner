
export const COLORS = {
  NEON_CYAN: '#00f3ff',
  NEON_PINK: '#bc13fe',
  NEON_YELLOW: '#f0f900',
  NEON_GREEN: '#0aff0a',
  NEON_RED: '#ff003c',
  NEON_ORANGE: '#ff9e00',
  NEON_PURPLE: '#8a2be2',
  DARK_BG: '#050505',
};

// Define specific physics/gameplay rules for each difficulty
export const DIFFICULTY_SETTINGS = {
  EASY: {
    INITIAL_SPEED: 4,      // Very slow
    MAX_SPEED: 8,          // Cap speed very low
    ACCELERATION: 0.001,   
    SPAWN_RATE_MODIFIER: 1.4,
    // Physics Modifiers for "Slow Motion" animation feel
    // Low gravity = floaty jump, Low jump force = normal height but slower
    GRAVITY_MOD: 0.5,      
    JUMP_MOD: 0.71         // sqrt(0.5) approx, keeps jump height same as normal but slower
  },
  MEDIUM: {
    INITIAL_SPEED: 7,      // Moderate
    MAX_SPEED: 14,
    ACCELERATION: 0.003,
    SPAWN_RATE_MODIFIER: 1.1,
    GRAVITY_MOD: 0.8,
    JUMP_MOD: 0.9
  },
  HARD: {
    INITIAL_SPEED: 10,     // Fast but playable
    MAX_SPEED: 20,         // Reduced from 40 (which was unplayable)
    ACCELERATION: 0.005,
    SPAWN_RATE_MODIFIER: 0.9,
    GRAVITY_MOD: 1.0,      // Normal physics
    JUMP_MOD: 1.0
  }
};

export const GAME_CONSTANTS = {
  GRAVITY: 0.8,
  JUMP_FORCE: -16,
  GROUND_Y: 550, // Y position of the floor on the canvas
  
  // These are now defaults, overridden by DIFFICULTY_SETTINGS
  INITIAL_SPEED: 8,
  MAX_SPEED: 25,
  SPEED_INCREMENT: 0.005,
  
  SPAWN_RATE_MIN: 60,
  SPAWN_RATE_MAX: 120,
  
  PLAYER_X: 150, // Fixed X position
  PLAYER_WIDTH: 50,
  PLAYER_HEIGHT: 80,
  PLAYER_DUCK_HEIGHT: 40,

  POWERUP_DURATION: 8000,
  SHAKE_INTENSITY: 10,
};

export const MOVEMENT_THRESHOLDS = {
  JUMP_THRESHOLD: 0.05, 
  DUCK_THRESHOLD: 0.05,
};

export const POWERUP_TYPES = {
  SHIELD: { color: COLORS.NEON_CYAN, label: 'SHIELD' },
  MULTIPLIER: { color: COLORS.NEON_YELLOW, label: 'SCORE x2' },
  SLOW_MO: { color: COLORS.NEON_PURPLE, label: 'SLOW MO' },
};

// Vaporwave / Retro Theme Palettes
export const VAPORWAVE_THEME = {
  SKY_GRADIENT_STAGES: [
    ['#0f2027', '#203a43', '#2c5364'], // Night
    ['#2b32b2', '#1488cc'],             // Dawn
    ['#cc2b5e', '#753a88'],             // Dusk (Purple/Pink)
    ['#1a2a6c', '#b21f1f', '#fdbb2d']   // Sunset (Fire)
  ]
};
