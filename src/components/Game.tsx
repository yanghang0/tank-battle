import { useEffect, useCallback, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { LEVEL_CONFIG } from '../constants/gameConfig';
import type { Direction } from '../types/game';

export const Game: React.FC = () => {
  const {
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
    lastSpawnTimeRef,
    lastPowerUpSpawnRef,
  } = useGameState();

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
      e.preventDefault();
    }

    keysPressed.current.add(e.code);

    if (e.code === 'KeyP' && gameState.gameStatus === 'playing') {
      pauseGame();
    } else if (e.code === 'KeyP' && gameState.gameStatus === 'paused') {
      pauseGame();
    }

    if (e.code === 'Space' && gameState.gameStatus === 'playing') {
      playerFire();
    }
  }, [gameState.gameStatus, pauseGame, playerFire]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.code);
  }, []);

  const processInput = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;

    const keys = keysPressed.current;

    if (keys.has('KeyW') || keys.has('ArrowUp')) {
      movePlayer('up');
    } else if (keys.has('KeyS') || keys.has('ArrowDown')) {
      movePlayer('down');
    } else if (keys.has('KeyA') || keys.has('ArrowLeft')) {
      movePlayer('left');
    } else if (keys.has('KeyD') || keys.has('ArrowRight')) {
      movePlayer('right');
    }
  }, [gameState.gameStatus, movePlayer]);

  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.gameStatus !== 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastFrameTime.current;
    
    if (deltaTime >= 16) {
      lastFrameTime.current = timestamp;

      processInput();
      updateGame();

      const now = Date.now();
      
      if (now - lastSpawnTimeRef.current > LEVEL_CONFIG.enemySpawnInterval) {
        spawnEnemy();
        lastSpawnTimeRef.current = now;
      }

      if (now - lastPowerUpSpawnRef.current > LEVEL_CONFIG.powerUpSpawnInterval) {
        spawnPowerUp();
        lastPowerUpSpawnRef.current = now;
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStatus, processInput, updateGame, spawnEnemy, spawnPowerUp, lastSpawnTimeRef, lastPowerUpSpawnRef]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div style={styles.gameContainer}>
      <div style={styles.gameWrapper}>
        <GameCanvas gameState={gameState} />
        <GameUI
          gameState={gameState}
          onStart={startGame}
          onPause={pauseGame}
          onNextLevel={nextLevel}
          onRestart={restartGame}
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  gameContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  gameWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};
