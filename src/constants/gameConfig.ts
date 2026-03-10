import type { GameConfig, PowerUpType } from '../types/game';

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  tileSize: 40,
  playerStartPos: { x: 100, y: 480 },
  enemySpawnPoints: [
    { x: 80, y: 40 },
    { x: 400, y: 40 },
    { x: 720, y: 40 },
  ],
};

export const TANK_CONFIG = {
  width: 36,
  height: 36,
  player: {
    health: 100,
    speed: 3,
    bulletSpeed: 8,
    bulletDamage: 25,
    fireRate: 300,
    color: '#4CAF50',
  },
  enemy: {
    health: 60,
    speed: 2,
    bulletSpeed: 6,
    bulletDamage: 15,
    fireRate: 1000,
    color: '#f44336',
  },
  boss: {
    health: 200,
    speed: 1.5,
    bulletSpeed: 5,
    bulletDamage: 35,
    fireRate: 800,
    color: '#9c27b0',
  },
};

export const BULLET_CONFIG = {
  width: 6,
  height: 12,
  playerSpeed: 10,
  enemySpeed: 7,
};

export const POWERUP_CONFIG: Record<PowerUpType, { color: string; duration: number; value: number }> = {
  health: { color: '#e91e63', duration: 0, value: 50 },
  speed: { color: '#2196f3', duration: 10000, value: 1.5 },
  damage: { color: '#ff9800', duration: 10000, value: 2 },
  shield: { color: '#9c27b0', duration: 8000, value: 0 },
  rapidFire: { color: '#00bcd4', duration: 8000, value: 0.5 },
  bomb: { color: '#795548', duration: 0, value: 0 },
};

export const WALL_CONFIG = {
  brick: { health: 100, color: '#8B4513' },
  steel: { health: Infinity, color: '#708090' },
  water: { health: Infinity, color: '#1E90FF' },
};

export const LEVEL_CONFIG = {
  maxEnemiesPerLevel: 10,
  enemySpawnInterval: 3000,
  powerUpSpawnInterval: 15000,
  powerUpDuration: 10000,
};

export const COLORS = {
  background: '#1a1a2e',
  grid: '#16213e',
  playerTank: '#4CAF50',
  enemyTank: '#f44336',
  bullet: '#ffeb3b',
  explosion: ['#ff5722', '#ff9800', '#ffc107', '#ffeb3b'],
  ui: {
    primary: '#00d4ff',
    secondary: '#7c3aed',
    danger: '#ef4444',
    success: '#22c55e',
    text: '#ffffff',
    background: 'rgba(0, 0, 0, 0.8)',
  },
};
