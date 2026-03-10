import { useState, useCallback, useRef } from 'react';
import type { GameState, Tank, Bullet, PowerUp, Explosion, Wall, Base, Direction, PowerUpType, LevelConfig } from '../types/game';
import { GAME_CONFIG, TANK_CONFIG, BULLET_CONFIG, POWERUP_CONFIG, LEVEL_CONFIG, WALL_CONFIG } from '../constants/gameConfig';
import { generateId, getDirectionVector, checkTankCollision, checkBulletTankCollision, checkBulletWallCollision, checkTankWallCollision, checkPowerUpCollision, checkBulletBaseCollision, isWithinBounds, getRandomDirection, clamp } from '../utils/gameUtils';

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    name: '新手训练场',
    description: '简单的地形，少量障碍物',
    wallDensity: 0.3,
    steelRatio: 0.1,
    waterRatio: 0.1,
    baseDefenseStrength: 2,
    backgroundColor: '#1a1a2e',
    gridColor: '#16213e',
  },
  {
    name: '沙漠风暴',
    description: '开阔地形，适合机动作战',
    wallDensity: 0.2,
    steelRatio: 0.05,
    waterRatio: 0,
    baseDefenseStrength: 3,
    backgroundColor: '#2d1f0f',
    gridColor: '#3d2a15',
  },
  {
    name: '钢铁堡垒',
    description: '大量钢墙，难以摧毁',
    wallDensity: 0.4,
    steelRatio: 0.4,
    waterRatio: 0.05,
    baseDefenseStrength: 4,
    backgroundColor: '#1a1a1a',
    gridColor: '#2a2a2a',
  },
  {
    name: '水域迷城',
    description: '大量水域，需要绕行',
    wallDensity: 0.35,
    steelRatio: 0.1,
    waterRatio: 0.3,
    baseDefenseStrength: 3,
    backgroundColor: '#0a1a2a',
    gridColor: '#102535',
  },
  {
    name: '迷宫战场',
    description: '复杂地形，考验驾驶技术',
    wallDensity: 0.5,
    steelRatio: 0.15,
    waterRatio: 0.1,
    baseDefenseStrength: 5,
    backgroundColor: '#1a0a1a',
    gridColor: '#251525',
  },
];

const createInitialPlayer = (): Tank => ({
  id: 'player',
  position: { ...GAME_CONFIG.playerStartPos },
  direction: 'up',
  health: TANK_CONFIG.player.health,
  maxHealth: TANK_CONFIG.player.health,
  speed: TANK_CONFIG.player.speed,
  bulletSpeed: TANK_CONFIG.player.bulletSpeed,
  bulletDamage: TANK_CONFIG.player.bulletDamage,
  fireRate: TANK_CONFIG.player.fireRate,
  lastFireTime: 0,
  isPlayer: true,
  level: 1,
  color: TANK_CONFIG.player.color,
  width: TANK_CONFIG.width,
  height: TANK_CONFIG.height,
  isShielded: false,
  shieldEndTime: 0,
});

const createEnemy = (spawnIndex: number, level: number): Tank => {
  const spawnPoint = GAME_CONFIG.enemySpawnPoints[spawnIndex % GAME_CONFIG.enemySpawnPoints.length];
  const isBoss = level > 3 && Math.random() < 0.2;
  const config = isBoss ? TANK_CONFIG.boss : TANK_CONFIG.enemy;
  
  return {
    id: generateId(),
    position: { ...spawnPoint },
    direction: 'down',
    health: config.health * (1 + level * 0.1),
    maxHealth: config.health * (1 + level * 0.1),
    speed: config.speed,
    bulletSpeed: config.bulletSpeed,
    bulletDamage: config.bulletDamage,
    fireRate: config.fireRate,
    lastFireTime: 0,
    isPlayer: false,
    level: isBoss ? level : 1,
    color: isBoss ? TANK_CONFIG.boss.color : TANK_CONFIG.enemy.color,
    width: TANK_CONFIG.width,
    height: TANK_CONFIG.height,
    isShielded: false,
    shieldEndTime: 0,
  };
};

const createWallsForLevel = (level: number): Wall[] => {
  const walls: Wall[] = [];
  const tileSize = GAME_CONFIG.tileSize;
  const config = LEVEL_CONFIGS[(level - 1) % LEVEL_CONFIGS.length];
  
  const baseX = GAME_CONFIG.canvasWidth / 2 - 30;
  const baseY = GAME_CONFIG.canvasHeight - 60;

  const defenseWalls = [
    { x: baseX - tileSize, y: baseY - tileSize },
    { x: baseX, y: baseY - tileSize },
    { x: baseX + tileSize, y: baseY - tileSize },
    
    { x: baseX - tileSize, y: baseY },
    { x: baseX + tileSize, y: baseY },
    
    { x: baseX - tileSize, y: baseY + tileSize },
    { x: baseX, y: baseY + tileSize },
    { x: baseX + tileSize, y: baseY + tileSize },
  ];

  defenseWalls.forEach(pos => {
    walls.push({
      id: generateId(),
      position: { x: pos.x, y: pos.y },
      width: tileSize,
      height: tileSize,
      type: 'brick',
      health: WALL_CONFIG.brick.health,
    });
  });

  const levelSeed = level * 1000;
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const wallCount = Math.floor(15 * config.wallDensity);
  for (let i = 0; i < wallCount; i++) {
    const seed = levelSeed + i;
    const x = Math.floor(random(seed) * (GAME_CONFIG.canvasWidth - 100) / tileSize) * tileSize + 50;
    const y = Math.floor(random(seed + 100) * (GAME_CONFIG.canvasHeight - 200) / tileSize) * tileSize + 100;
    
    if (y > baseY - tileSize * 2 && y < baseY + 2 * tileSize && 
        x > baseX - tileSize * 2 && x < baseX + 2 * tileSize) {
      continue;
    }
    
    const rand = random(seed + 200);
    let type: 'brick' | 'steel' | 'water' = 'brick';
    
    if (rand < config.steelRatio) {
      type = 'steel';
    } else if (rand < config.steelRatio + config.waterRatio) {
      type = 'water';
    }
    
    walls.push({
      id: generateId(),
      position: { x, y },
      width: tileSize,
      height: tileSize,
      type,
      health: WALL_CONFIG[type].health,
    });
  }

  const patternWalls = generateLevelPattern(level, tileSize);
  walls.push(...patternWalls);

  return walls;
};

const generateLevelPattern = (level: number, tileSize: number): Wall[] => {
  const walls: Wall[] = [];
  const patternIndex = (level - 1) % 5;
  
  switch (patternIndex) {
    case 0:
      for (let i = 0; i < 3; i++) {
        walls.push({
          id: generateId(),
          position: { x: 200 + i * 200, y: 200 },
          width: tileSize,
          height: tileSize,
          type: 'brick',
          health: WALL_CONFIG.brick.health,
        });
      }
      break;
    case 1:
      for (let i = 0; i < 4; i++) {
        walls.push({
          id: generateId(),
          position: { x: 150 + i * 150, y: 250 },
          width: tileSize,
          height: tileSize,
          type: i % 2 === 0 ? 'steel' : 'brick',
          health: i % 2 === 0 ? WALL_CONFIG.steel.health : WALL_CONFIG.brick.health,
        });
      }
      break;
    case 2:
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          walls.push({
            id: generateId(),
            position: { x: 200 + i * 400, y: 150 + j * 100 },
            width: tileSize,
            height: tileSize,
            type: 'steel',
            health: WALL_CONFIG.steel.health,
          });
        }
      }
      break;
    case 3:
      for (let i = 0; i < 5; i++) {
        walls.push({
          id: generateId(),
          position: { x: 100 + i * 150, y: 350 },
          width: tileSize,
          height: tileSize,
          type: 'water',
          health: WALL_CONFIG.water.health,
        });
      }
      break;
    case 4:
      walls.push({
        id: generateId(),
        position: { x: 400, y: 300 },
        width: tileSize,
        height: tileSize,
        type: 'steel',
        health: WALL_CONFIG.steel.health,
      });
      for (let i = 0; i < 4; i++) {
        walls.push({
          id: generateId(),
          position: { x: 280 + i * 80, y: 200 },
          width: tileSize,
          height: tileSize,
          type: 'brick',
          health: WALL_CONFIG.brick.health,
        });
      }
      break;
  }
  
  return walls;
};

const createPlayerBase = (): Base => ({
  position: { x: GAME_CONFIG.canvasWidth / 2 - 30, y: GAME_CONFIG.canvasHeight - 60 },
  width: 60,
  height: 40,
  health: 100,
  isPlayerBase: true,
});

const createInitialGameState = (): GameState => ({
  player: createInitialPlayer(),
  enemies: [],
  bullets: [],
  powerUps: [],
  explosions: [],
  walls: createWallsForLevel(1),
  playerBase: createPlayerBase(),
  score: 0,
  level: 1,
  lives: 3,
  gameStatus: 'menu',
  enemiesRemaining: LEVEL_CONFIG.maxEnemiesPerLevel,
  enemiesSpawned: 0,
  maxEnemies: LEVEL_CONFIG.maxEnemiesPerLevel,
  currentLevelConfig: LEVEL_CONFIGS[0],
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const keysRef = useRef<Set<string>>(new Set());
  const lastSpawnTimeRef = useRef<number>(0);
  const lastPowerUpSpawnRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState({
      ...createInitialGameState(),
      gameStatus: 'playing',
    });
    lastSpawnTimeRef.current = Date.now();
    lastPowerUpSpawnRef.current = Date.now();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const movePlayer = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (!prev.player || prev.gameStatus !== 'playing') return prev;

      const dirVector = getDirectionVector(direction);
      const newX = prev.player.position.x + dirVector.x * prev.player.speed;
      const newY = prev.player.position.y + dirVector.y * prev.player.speed;

      const newPlayer = {
        ...prev.player,
        position: {
          x: clamp(newX, 0, GAME_CONFIG.canvasWidth - prev.player.width),
          y: clamp(newY, 0, GAME_CONFIG.canvasHeight - prev.player.height),
        },
        direction,
      };

      for (const wall of prev.walls) {
        if (wall.type !== 'water' && checkTankWallCollision(newPlayer, wall)) {
          return { ...prev, player: { ...prev.player, direction } };
        }
      }

      for (const enemy of prev.enemies) {
        if (checkTankCollision(newPlayer, enemy)) {
          return { ...prev, player: { ...prev.player, direction } };
        }
      }

      return { ...prev, player: newPlayer };
    });
  }, []);

  const fireBullet = useCallback((tank: Tank): Bullet => {
    const centerX = tank.position.x + tank.width / 2;
    const centerY = tank.position.y + tank.height / 2;
    
    let bulletX: number;
    let bulletY: number;
    
    switch (tank.direction) {
      case 'up':
        bulletX = centerX - BULLET_CONFIG.width / 2;
        bulletY = tank.position.y - BULLET_CONFIG.height - 4;
        break;
      case 'down':
        bulletX = centerX - BULLET_CONFIG.width / 2;
        bulletY = tank.position.y + tank.height + 4;
        break;
      case 'left':
        bulletX = tank.position.x - BULLET_CONFIG.height - 4;
        bulletY = centerY - BULLET_CONFIG.width / 2;
        break;
      case 'right':
        bulletX = tank.position.x + tank.width + 4;
        bulletY = centerY - BULLET_CONFIG.width / 2;
        break;
    }
    
    return {
      id: generateId(),
      position: { x: bulletX, y: bulletY },
      direction: tank.direction,
      speed: tank.bulletSpeed,
      damage: tank.bulletDamage,
      ownerId: tank.id,
      width: tank.direction === 'up' || tank.direction === 'down' ? BULLET_CONFIG.width : BULLET_CONFIG.height,
      height: tank.direction === 'up' || tank.direction === 'down' ? BULLET_CONFIG.height : BULLET_CONFIG.width,
    };
  }, []);

  const playerFire = useCallback(() => {
    setGameState(prev => {
      if (!prev.player || prev.gameStatus !== 'playing') return prev;

      const now = Date.now();
      const effectiveFireRate = prev.player.isShielded ? prev.player.fireRate * 0.5 : prev.player.fireRate;
      
      if (now - prev.player.lastFireTime < effectiveFireRate) return prev;

      const newBullet = fireBullet(prev.player);
      
      return {
        ...prev,
        player: { ...prev.player, lastFireTime: now },
        bullets: [...prev.bullets, newBullet],
      };
    });
  }, [fireBullet]);

  const spawnEnemy = useCallback(() => {
    setGameState(prev => {
      if (prev.enemiesSpawned >= prev.maxEnemies || prev.enemies.length >= 4) return prev;

      const newEnemy = createEnemy(prev.enemiesSpawned, prev.level);
      
      return {
        ...prev,
        enemies: [...prev.enemies, newEnemy],
        enemiesSpawned: prev.enemiesSpawned + 1,
        enemiesRemaining: prev.enemiesRemaining - 1,
      };
    });
  }, []);

  const spawnPowerUp = useCallback(() => {
    setGameState(prev => {
      const types: PowerUpType[] = ['health', 'speed', 'damage', 'shield', 'rapidFire', 'bomb'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newPowerUp: PowerUp = {
        id: generateId(),
        position: {
          x: Math.random() * (GAME_CONFIG.canvasWidth - 30) + 15,
          y: Math.random() * (GAME_CONFIG.canvasHeight - 200) + 100,
        },
        type,
        width: 30,
        height: 30,
        spawnTime: Date.now(),
        duration: LEVEL_CONFIG.powerUpDuration,
      };

      return {
        ...prev,
        powerUps: [...prev.powerUps, newPowerUp],
      };
    });
  }, []);

  const applyPowerUp = useCallback((powerUp: PowerUp) => {
    setGameState(prev => {
      if (!prev.player) return prev;

      let updatedPlayer = { ...prev.player };
      let newScore = prev.score;

      switch (powerUp.type) {
        case 'health':
          updatedPlayer.health = Math.min(updatedPlayer.health + POWERUP_CONFIG.health.value, updatedPlayer.maxHealth);
          break;
        case 'speed':
          updatedPlayer.speed = TANK_CONFIG.player.speed * POWERUP_CONFIG.speed.value;
          setTimeout(() => {
            setGameState(p => p.player ? { ...p, player: { ...p.player, speed: TANK_CONFIG.player.speed } } : p);
          }, POWERUP_CONFIG.speed.duration);
          break;
        case 'damage':
          updatedPlayer.bulletDamage = TANK_CONFIG.player.bulletDamage * POWERUP_CONFIG.damage.value;
          setTimeout(() => {
            setGameState(p => p.player ? { ...p, player: { ...p.player, bulletDamage: TANK_CONFIG.player.bulletDamage } } : p);
          }, POWERUP_CONFIG.damage.duration);
          break;
        case 'shield':
          updatedPlayer.isShielded = true;
          updatedPlayer.shieldEndTime = Date.now() + POWERUP_CONFIG.shield.duration;
          setTimeout(() => {
            setGameState(p => p.player ? { ...p, player: { ...p.player, isShielded: false } } : p);
          }, POWERUP_CONFIG.shield.duration);
          break;
        case 'rapidFire':
          updatedPlayer.fireRate = TANK_CONFIG.player.fireRate * POWERUP_CONFIG.rapidFire.value;
          setTimeout(() => {
            setGameState(p => p.player ? { ...p, player: { ...p.player, fireRate: TANK_CONFIG.player.fireRate } } : p);
          }, POWERUP_CONFIG.rapidFire.duration);
          break;
        case 'bomb':
          newScore += prev.enemies.length * 100;
          prev.enemies.forEach(enemy => {
            prev.explosions.push({
              id: generateId(),
              position: { ...enemy.position },
              startTime: Date.now(),
              duration: 500,
              radius: 40,
            });
          });
          return {
            ...prev,
            player: updatedPlayer,
            enemies: [],
            powerUps: prev.powerUps.filter(p => p.id !== powerUp.id),
            explosions: prev.explosions,
            score: newScore,
          };
      }

      return {
        ...prev,
        player: updatedPlayer,
        powerUps: prev.powerUps.filter(p => p.id !== powerUp.id),
        score: newScore + 50,
      };
    });
  }, []);

  const createExplosion = useCallback((position: { x: number; y: number }, radius: number = 30): Explosion => ({
    id: generateId(),
    position: { ...position },
    startTime: Date.now(),
    duration: 500,
    radius,
  }), []);

  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.player) return prev;

      const now = Date.now();
      let newBullets = [...prev.bullets];
      let newEnemies = [...prev.enemies];
      let newExplosions = [...prev.explosions];
      let newWalls = [...prev.walls];
      let newScore = prev.score;
      let newLives = prev.lives;
      let newPlayer = { ...prev.player };
      let newPlayerBase = { ...prev.playerBase };

      newBullets = newBullets.map(bullet => {
        const dir = getDirectionVector(bullet.direction);
        return {
          ...bullet,
          position: {
            x: bullet.position.x + dir.x * bullet.speed,
            y: bullet.position.y + dir.y * bullet.speed,
          },
        };
      });

      newBullets = newBullets.filter(bullet => {
        return isWithinBounds(
          bullet.position,
          bullet.width,
          bullet.height,
          GAME_CONFIG.canvasWidth,
          GAME_CONFIG.canvasHeight
        );
      });

      const bulletsToRemove = new Set<string>();
      const enemiesToRemove = new Set<string>();

      newBullets.forEach(bullet => {
        if (bullet.ownerId === 'player') {
          newEnemies.forEach(enemy => {
            if (checkBulletTankCollision(bullet, enemy)) {
              bulletsToRemove.add(bullet.id);
              enemy.health -= bullet.damage;
              if (enemy.health <= 0) {
                enemiesToRemove.add(enemy.id);
                newExplosions.push(createExplosion(enemy.position));
                newScore += enemy.level > 1 ? 200 : 100;
              }
            }
          });
        } else {
          if (checkBulletTankCollision(bullet, newPlayer)) {
            if (!newPlayer.isShielded) {
              bulletsToRemove.add(bullet.id);
              newPlayer.health -= bullet.damage;
              if (newPlayer.health <= 0) {
                newExplosions.push(createExplosion(newPlayer.position));
                newLives--;
                if (newLives > 0) {
                  newPlayer = createInitialPlayer();
                }
              }
            } else {
              bulletsToRemove.add(bullet.id);
            }
          }
        }

        newWalls.forEach(wall => {
          if (wall.type !== 'water' && checkBulletWallCollision(bullet, wall)) {
            bulletsToRemove.add(bullet.id);
            if (wall.type === 'brick') {
              wall.health -= bullet.damage;
            }
          }
        });

        if (checkBulletBaseCollision(bullet, newPlayerBase)) {
          bulletsToRemove.add(bullet.id);
          newPlayerBase = {
            ...newPlayerBase,
            health: newPlayerBase.health - bullet.damage,
          };
        }
      });

      newBullets = newBullets.filter(b => !bulletsToRemove.has(b.id));
      newEnemies = newEnemies.filter(e => !enemiesToRemove.has(e.id));
      newWalls = newWalls.filter(w => w.health > 0);

      newEnemies = newEnemies.map(enemy => {
        if (Math.random() < 0.02) {
          enemy.direction = getRandomDirection();
        }

        const dir = getDirectionVector(enemy.direction);
        const newX = enemy.position.x + dir.x * enemy.speed;
        const newY = enemy.position.y + dir.y * enemy.speed;

        const newEnemy = {
          ...enemy,
          position: {
            x: clamp(newX, 0, GAME_CONFIG.canvasWidth - enemy.width),
            y: clamp(newY, 0, GAME_CONFIG.canvasHeight - enemy.height),
          },
        };

        let collision = false;
        for (const wall of newWalls) {
          if (wall.type !== 'water' && checkTankWallCollision(newEnemy, wall)) {
            collision = true;
            break;
          }
        }

        if (checkTankCollision(newEnemy, newPlayer)) {
          collision = true;
        }

        for (const other of newEnemies) {
          if (other.id !== enemy.id && checkTankCollision(newEnemy, other)) {
            collision = true;
            break;
          }
        }

        if (collision) {
          return { ...enemy, direction: getRandomDirection() };
        }

        return newEnemy;
      });

      newEnemies.forEach(enemy => {
        if (now - enemy.lastFireTime > enemy.fireRate && Math.random() < 0.05) {
          const newBullet = fireBullet(enemy);
          newBullets.push(newBullet);
          enemy.lastFireTime = now;
        }
      });

      const powerUpsToRemove = new Set<string>();
      prev.powerUps.forEach(powerUp => {
        if (now - powerUp.spawnTime > powerUp.duration) {
          powerUpsToRemove.add(powerUp.id);
        } else if (checkPowerUpCollision(newPlayer, powerUp)) {
          powerUpsToRemove.add(powerUp.id);
          applyPowerUp(powerUp);
          newScore += 50;
        }
      });

      newExplosions = newExplosions.filter(exp => now - exp.startTime < exp.duration);

      let gameStatus = prev.gameStatus;
      if (newLives <= 0 || newPlayerBase.health <= 0) {
        gameStatus = 'gameOver';
      } else if (newEnemies.length === 0 && prev.enemiesSpawned >= prev.maxEnemies) {
        gameStatus = 'victory';
      }

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies,
        bullets: newBullets,
        explosions: newExplosions,
        walls: newWalls,
        playerBase: newPlayerBase,
        powerUps: prev.powerUps.filter(p => !powerUpsToRemove.has(p.id)),
        score: newScore,
        lives: newLives,
        gameStatus,
      };
    });
  }, [applyPowerUp, createExplosion, fireBullet]);

  const nextLevel = useCallback(() => {
    setGameState(prev => {
      const newLevel = prev.level + 1;
      const levelConfig = LEVEL_CONFIGS[(newLevel - 1) % LEVEL_CONFIGS.length];
      
      const newPlayer = prev.player ? {
        ...prev.player,
        health: TANK_CONFIG.player.health,
        maxHealth: TANK_CONFIG.player.health,
        position: { ...GAME_CONFIG.playerStartPos },
        direction: 'up' as Direction,
        speed: TANK_CONFIG.player.speed,
        bulletDamage: TANK_CONFIG.player.bulletDamage,
        fireRate: TANK_CONFIG.player.fireRate,
        isShielded: false,
        shieldEndTime: 0,
      } : null;

      return {
        ...prev,
        player: newPlayer,
        enemies: [],
        bullets: [],
        powerUps: [],
        explosions: [],
        walls: createWallsForLevel(newLevel),
        playerBase: createPlayerBase(),
        level: newLevel,
        enemiesRemaining: LEVEL_CONFIG.maxEnemiesPerLevel + newLevel * 2,
        enemiesSpawned: 0,
        maxEnemies: LEVEL_CONFIG.maxEnemiesPerLevel + newLevel * 2,
        gameStatus: 'playing',
        currentLevelConfig: levelConfig,
      };
    });
    lastSpawnTimeRef.current = Date.now();
    lastPowerUpSpawnRef.current = Date.now();
  }, []);

  const restartGame = useCallback(() => {
    setGameState(createInitialGameState());
    startGame();
  }, [startGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    movePlayer,
    playerFire,
    spawnEnemy,
    spawnPowerUp,
    updateGame,
    nextLevel,
    restartGame,
    keysRef,
    lastSpawnTimeRef,
    lastPowerUpSpawnRef,
  };
};
