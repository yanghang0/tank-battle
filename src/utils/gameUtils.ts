import type { Position, Direction, Tank, Bullet, PowerUp, Wall, Base } from '../types/game';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const getDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

export const getDirectionVector = (direction: Direction): Position => {
  switch (direction) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
  }
};

export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
};

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const checkRectCollision = (rect1: Rectangle, rect2: Rectangle): boolean => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

export const checkTankCollision = (tank: Tank, other: Tank): boolean => {
  return checkRectCollision(
    { x: tank.position.x, y: tank.position.y, width: tank.width, height: tank.height },
    { x: other.position.x, y: other.position.y, width: other.width, height: other.height }
  );
};

export const checkBulletTankCollision = (bullet: Bullet, tank: Tank): boolean => {
  return checkRectCollision(
    { x: bullet.position.x, y: bullet.position.y, width: bullet.width, height: bullet.height },
    { x: tank.position.x, y: tank.position.y, width: tank.width, height: tank.height }
  );
};

export const checkBulletWallCollision = (bullet: Bullet, wall: Wall): boolean => {
  return checkRectCollision(
    { x: bullet.position.x, y: bullet.position.y, width: bullet.width, height: bullet.height },
    { x: wall.position.x, y: wall.position.y, width: wall.width, height: wall.height }
  );
};

export const checkTankWallCollision = (tank: Tank, wall: Wall): boolean => {
  return checkRectCollision(
    { x: tank.position.x, y: tank.position.y, width: tank.width, height: tank.height },
    { x: wall.position.x, y: wall.position.y, width: wall.width, height: wall.height }
  );
};

export const checkPowerUpCollision = (tank: Tank, powerUp: PowerUp): boolean => {
  return checkRectCollision(
    { x: tank.position.x, y: tank.position.y, width: tank.width, height: tank.height },
    { x: powerUp.position.x, y: powerUp.position.y, width: powerUp.width, height: powerUp.height }
  );
};

export const checkBulletBaseCollision = (bullet: Bullet, base: Base): boolean => {
  return checkRectCollision(
    { x: bullet.position.x, y: bullet.position.y, width: bullet.width, height: bullet.height },
    { x: base.position.x, y: base.position.y, width: base.width, height: base.height }
  );
};

export const isWithinBounds = (pos: Position, width: number, height: number, canvasWidth: number, canvasHeight: number): boolean => {
  return pos.x >= 0 && pos.x + width <= canvasWidth && pos.y >= 0 && pos.y + height <= canvasHeight;
};

export const getRandomDirection = (): Direction => {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  return directions[Math.floor(Math.random() * directions.length)];
};

export const getRandomPosition = (minX: number, maxX: number, minY: number, maxY: number): Position => {
  return {
    x: Math.floor(Math.random() * (maxX - minX) + minX),
    y: Math.floor(Math.random() * (maxY - minY) + minY),
  };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const easeOutQuad = (t: number): number => {
  return t * (2 - t);
};

export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};
