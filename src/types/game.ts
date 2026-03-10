export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  tileSize: number;
  playerStartPos: Position;
  enemySpawnPoints: Position[];
}

export interface Tank {
  id: string;
  position: Position;
  direction: Direction;
  health: number;
  maxHealth: number;
  speed: number;
  bulletSpeed: number;
  bulletDamage: number;
  fireRate: number;
  lastFireTime: number;
  isPlayer: boolean;
  level: number;
  color: string;
  width: number;
  height: number;
  isShielded: boolean;
  shieldEndTime: number;
}

export interface Bullet {
  id: string;
  position: Position;
  direction: Direction;
  speed: number;
  damage: number;
  ownerId: string;
  width: number;
  height: number;
}

export type PowerUpType = 'health' | 'speed' | 'damage' | 'shield' | 'rapidFire' | 'bomb';

export interface PowerUp {
  id: string;
  position: Position;
  type: PowerUpType;
  width: number;
  height: number;
  spawnTime: number;
  duration: number;
}

export interface Explosion {
  id: string;
  position: Position;
  startTime: number;
  duration: number;
  radius: number;
}

export interface Wall {
  id: string;
  position: Position;
  width: number;
  height: number;
  type: 'brick' | 'steel' | 'water';
  health: number;
}

export interface Base {
  position: Position;
  width: number;
  height: number;
  health: number;
  isPlayerBase: boolean;
}

export interface LevelConfig {
  name: string;
  description: string;
  wallDensity: number;
  steelRatio: number;
  waterRatio: number;
  baseDefenseStrength: number;
  backgroundColor: string;
  gridColor: string;
}

export interface GameState {
  player: Tank | null;
  enemies: Tank[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  explosions: Explosion[];
  walls: Wall[];
  playerBase: Base;
  score: number;
  level: number;
  lives: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory';
  enemiesRemaining: number;
  enemiesSpawned: number;
  maxEnemies: number;
  currentLevelConfig: LevelConfig;
}

export interface Keys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
}
