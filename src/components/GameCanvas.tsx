import { useRef, useEffect, useCallback } from 'react';
import type { GameState, Tank, Bullet, PowerUp, Explosion, Wall, Base, Direction } from '../types/game';
import { GAME_CONFIG, COLORS, POWERUP_CONFIG, WALL_CONFIG } from '../constants/gameConfig';
import { easeOutCubic } from '../utils/gameUtils';

interface GameCanvasProps {
  gameState: GameState;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawTank = useCallback((ctx: CanvasRenderingContext2D, tank: Tank) => {
    ctx.save();
    ctx.translate(tank.position.x + tank.width / 2, tank.position.y + tank.height / 2);

    const angle: Record<Direction, number> = {
      up: 0,
      right: Math.PI / 2,
      down: Math.PI,
      left: -Math.PI / 2,
    };
    ctx.rotate(angle[tank.direction]);

    const gradient = ctx.createLinearGradient(-tank.width / 2, 0, tank.width / 2, 0);
    gradient.addColorStop(0, tank.color);
    gradient.addColorStop(0.5, lightenColor(tank.color, 30));
    gradient.addColorStop(1, tank.color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height, 4);
    ctx.fill();

    ctx.fillStyle = darkenColor(tank.color, 20);
    ctx.fillRect(-tank.width / 2 + 3, -tank.height / 2 + 3, 8, tank.height - 6);
    ctx.fillRect(tank.width / 2 - 11, -tank.height / 2 + 3, 8, tank.height - 6);

    ctx.fillStyle = lightenColor(tank.color, 40);
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = tank.color;
    ctx.fillRect(-3, -tank.height / 2 - 8, 6, 12);

    if (tank.isShielded) {
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, tank.width / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();

      const shieldPulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(147, 51, 234, ${shieldPulse * 0.4})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, tank.width / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (tank.health < tank.maxHealth) {
      const healthPercent = tank.health / tank.maxHealth;
      const barWidth = tank.width;
      const barHeight = 4;
      const barX = tank.position.x;
      const barY = tank.position.y - 8;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const healthColor = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillStyle = healthColor;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
  }, []);

  const drawBullet = useCallback((ctx: CanvasRenderingContext2D, bullet: Bullet) => {
    ctx.save();
    ctx.translate(bullet.position.x + bullet.width / 2, bullet.position.y + bullet.height / 2);

    const angle: Record<Direction, number> = {
      up: 0,
      right: Math.PI / 2,
      down: Math.PI,
      left: -Math.PI / 2,
    };
    ctx.rotate(angle[bullet.direction]);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, COLORS.bullet);
    gradient.addColorStop(1, '#f59e0b');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = COLORS.bullet;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  const drawPowerUp = useCallback((ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    const config = POWERUP_CONFIG[powerUp.type];
    const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
    const size = powerUp.width * pulse;

    ctx.save();
    ctx.translate(powerUp.position.x + powerUp.width / 2, powerUp.position.y + powerUp.height / 2);

    ctx.shadowColor = config.color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-size / 6, -size / 6, size / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons: Record<string, string> = {
      health: '+',
      speed: '»',
      damage: '!',
      shield: '◊',
      rapidFire: '≡',
      bomb: '✸',
    };
    ctx.fillText(icons[powerUp.type] || '?', 0, 1);

    ctx.restore();
  }, []);

  const drawExplosion = useCallback((ctx: CanvasRenderingContext2D, explosion: Explosion) => {
    const elapsed = Date.now() - explosion.startTime;
    const progress = elapsed / explosion.duration;
    const radius = explosion.radius * easeOutCubic(progress);

    ctx.save();
    ctx.translate(explosion.position.x + 18, explosion.position.y + 18);

    for (let i = 0; i < 3; i++) {
      const layerRadius = Math.max(1, radius * (1 - i * 0.25));
      const alpha = Math.max(0, (1 - progress) * (1 - i * 0.3));
      
      if (alpha <= 0 || layerRadius <= 0) continue;
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerRadius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(255, 200, 50, ${alpha * 0.8})`);
      gradient.addColorStop(0.6, `rgba(255, 100, 50, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 50, 50, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + progress * Math.PI;
      const distance = radius * 0.8 * progress;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const particleSize = Math.max(0.5, 4 * (1 - progress));
      const particleAlpha = Math.max(0, 1 - progress);

      ctx.fillStyle = `rgba(255, 200, 100, ${particleAlpha})`;
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  const drawWall = useCallback((ctx: CanvasRenderingContext2D, wall: Wall) => {
    ctx.save();

    const config = WALL_CONFIG[wall.type];
    
    if (wall.type === 'water') {
      const waveOffset = Math.sin(Date.now() / 500) * 3;
      const gradient = ctx.createLinearGradient(
        wall.position.x,
        wall.position.y,
        wall.position.x,
        wall.position.y + wall.height
      );
      gradient.addColorStop(0, '#1e90ff');
      gradient.addColorStop(0.5, '#4169e1');
      gradient.addColorStop(1, '#1e90ff');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(wall.position.x, wall.position.y + waveOffset, wall.width, wall.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 3; i++) {
        const waveX = wall.position.x + (i * 15) + Math.sin(Date.now() / 300 + i) * 5;
        ctx.fillRect(waveX, wall.position.y + 5, 10, 3);
      }
    } else if (wall.type === 'brick') {
      const brickWidth = wall.width / 2;
      const brickHeight = wall.height / 2;
      
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const x = wall.position.x + col * brickWidth;
          const y = wall.position.y + row * brickHeight;
          
          ctx.fillStyle = config.color;
          ctx.fillRect(x + 1, y + 1, brickWidth - 2, brickHeight - 2);
          
          ctx.fillStyle = lightenColor(config.color, 20);
          ctx.fillRect(x + 1, y + 1, brickWidth - 2, 2);
          ctx.fillRect(x + 1, y + 1, 2, brickHeight - 2);
          
          ctx.fillStyle = darkenColor(config.color, 20);
          ctx.fillRect(x + brickWidth - 3, y + 1, 2, brickHeight - 2);
          ctx.fillRect(x + 1, y + brickHeight - 3, brickWidth - 2, 2);
        }
      }
    } else {
      const gradient = ctx.createLinearGradient(
        wall.position.x,
        wall.position.y,
        wall.position.x + wall.width,
        wall.position.y + wall.height
      );
      gradient.addColorStop(0, '#808080');
      gradient.addColorStop(0.5, '#a0a0a0');
      gradient.addColorStop(1, '#707070');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(wall.position.x, wall.position.y, wall.width, wall.height);

      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.position.x + 2, wall.position.y + 2, wall.width - 4, wall.height - 4);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(wall.position.x + 4, wall.position.y + 4, wall.width - 8, 4);
    }

    ctx.restore();
  }, []);

  const drawBase = useCallback((ctx: CanvasRenderingContext2D, base: Base) => {
    ctx.save();

    const gradient = ctx.createLinearGradient(
      base.position.x,
      base.position.y,
      base.position.x,
      base.position.y + base.height
    );
    
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#15803d');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(base.position.x + base.width / 2, base.position.y);
    ctx.lineTo(base.position.x + base.width, base.position.y + base.height);
    ctx.lineTo(base.position.x, base.position.y + base.height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', base.position.x + base.width / 2, base.position.y + base.height / 2);

    const healthPercent = base.health / 100;
    const barWidth = base.width;
    const barHeight = 4;
    const barX = base.position.x;
    const barY = base.position.y - 8;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.restore();
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const bgColor = gameState.currentLevelConfig?.backgroundColor || COLORS.background;
    const gridColor = gameState.currentLevelConfig?.gridColor || COLORS.grid;
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    
    const gridSize = GAME_CONFIG.tileSize;
    for (let x = 0; x <= GAME_CONFIG.canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_CONFIG.canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.canvasWidth, y);
      ctx.stroke();
    }
  }, [gameState.currentLevelConfig]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackground(ctx);

    gameState.walls.forEach(wall => drawWall(ctx, wall));

    drawBase(ctx, gameState.playerBase);

    gameState.powerUps.forEach(powerUp => drawPowerUp(ctx, powerUp));

    gameState.bullets.forEach(bullet => drawBullet(ctx, bullet));

    if (gameState.player) {
      drawTank(ctx, gameState.player);
    }

    gameState.enemies.forEach(enemy => drawTank(ctx, enemy));

    gameState.explosions.forEach(explosion => drawExplosion(ctx, explosion));
  }, [gameState, drawBackground, drawWall, drawBase, drawPowerUp, drawBullet, drawTank, drawExplosion]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.canvasWidth}
      height={GAME_CONFIG.canvasHeight}
      style={{
        border: '3px solid #00d4ff',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
      }}
    />
  );
};

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
