export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type CharacterAction = 'RUN' | 'JUMP' | 'DOUBLE_JUMP' | 'SLIDE' | 'CRASH';

export type PowerUpType = 'MAGNET' | 'SHIELD' | 'MULTIPLIER' | 'SUPER_JUMP';

export interface PowerUpActive {
  type: PowerUpType;
  duration: number; // in seconds
  maxDuration: number;
}

export type ObstacleType = 
  | 'CRATE'             // Jump over
  | 'DOUBLE_CRATE'      // Jump over (higher)
  | 'ROAD_BARRIER'      // Jump over (medium height)
  | 'LOW_OVERHEAD_SIGN' // Must slide under!
  | 'TRAIN_CAR'         // Can jump onto roof or jump over
  | 'HAZARD_CONES';     // Ground hazard

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  scored?: boolean;
  solidTop?: boolean; // Can player land on top (like train car)?
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  rotation: number;
}

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  pulse: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  shape?: 'circle' | 'star' | 'spark' | 'confetti';
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface CharacterSkin {
  id: string;
  name: string;
  price: number;
  description: string;
  colors: {
    cap: string;
    capFront: string;
    hoodie: string;
    innerShirt: string;
    pants: string;
    shoes: string;
    shoeSoles: string;
    hair: string;
    backpack: string;
    glow?: string;
  };
  unlocked: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  type: 'DISTANCE' | 'COINS_RUN' | 'DOUBLE_JUMP' | 'SLIDE_OBSTACLE' | 'POWERUPS' | 'SCORE';
}

export interface GameSettings {
  musicVolume: number; // 0 - 1
  sfxVolume: number;   // 0 - 1
  soundMuted: boolean;
  touchControls: 'buttons' | 'gestures' | 'both';
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  coins: number;
  date: string;
}
