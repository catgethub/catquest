// Game Types for CatQuest

export type CharacterType = 'badju' | 'christo' | 'lou' | 'teri';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Character {
  id: CharacterType;
  name: string;
  description: string;
  color: string;
  ability: string;
  speed: number;
  jumpPower: number;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'grass' | 'stone' | 'ice' | 'moving' | 'brick' | 'terracotta';
  movingDirection?: 'horizontal' | 'vertical';
  movingRange?: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'slime' | 'bat' | 'spike';
  patrolStart?: number;
  patrolEnd?: number;
  speed: number;
  direction: 1 | -1;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'coin' | 'heart' | 'star' | 'powerup';
  collected: boolean;
  value: number;
}

export interface Portal {
  id: string;
  x: number;
  y: number;
  targetLevel: number;
  active: boolean;
}

export interface Level {
  id: number;
  name: string;
  theme: 'meadow' | 'forest' | 'sky' | 'building' | 'whitten' | 'donuts' | 'c2' | 'skyline' | 'metro' | 'catwalk' | 'purpleline';
  background: string;
  platforms: Platform[];
  enemies: Enemy[];
  collectibles: Collectible[];
  portal: Portal;
  playerStart: Position;
  width: number;
  height: number;
}

export interface PlayerState {
  position: Position;
  velocity: Velocity;
  isGrounded: boolean;
  isJumping: boolean;
  facingRight: boolean;
  isMoving: boolean;
  health: number;
  maxHealth: number;
  coins: number;
  stars: number;
  isInvulnerable: boolean;
}

export interface GameState {
  currentLevel: number;
  selectedCharacter: CharacterType;
  player: PlayerState;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  isVictory: boolean;
  score: number;
  lives: number;
  totalCoins: number;
  totalStars: number;
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESTART_LEVEL' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'SELECT_CHARACTER'; character: CharacterType }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'STOP_MOVING' }
  | { type: 'JUMP' }
  | { type: 'UPDATE_POSITION'; position: Position; velocity: Velocity; isGrounded: boolean }
  | { type: 'COLLECT_ITEM'; collectibleId: string; value: number; itemType: 'coin' | 'heart' | 'star' | 'powerup' }
  | { type: 'TAKE_DAMAGE'; amount: number }
  | { type: 'LEVEL_COMPLETE' }
  | { type: 'GAME_OVER' }
  | { type: 'SELECT_LEVEL'; level: number };
