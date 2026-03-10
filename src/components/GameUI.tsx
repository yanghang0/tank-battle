import React from 'react';
import type { GameState } from '../types/game';
import { COLORS } from '../constants/gameConfig';

interface GameUIProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onNextLevel: () => void;
  onRestart: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onStart,
  onPause,
  onNextLevel,
  onRestart,
}) => {
  return (
    <>
      {gameState.gameStatus === 'playing' && (
        <HUD gameState={gameState} onPause={onPause} />
      )}

      {gameState.gameStatus === 'menu' && (
        <MenuOverlay onStart={onStart} />
      )}

      {gameState.gameStatus === 'paused' && (
        <PauseOverlay onResume={onPause} onRestart={onRestart} />
      )}

      {gameState.gameStatus === 'gameOver' && (
        <GameOverOverlay score={gameState.score} level={gameState.level} onRestart={onRestart} />
      )}

      {gameState.gameStatus === 'victory' && (
        <VictoryOverlay 
          level={gameState.level} 
          score={gameState.score} 
          levelName={gameState.currentLevelConfig?.name || '新关卡'}
          onNextLevel={onNextLevel} 
        />
      )}
    </>
  );
};

interface HUDProps {
  gameState: GameState;
  onPause: () => void;
}

const HUD: React.FC<HUDProps> = ({ gameState, onPause }) => {
  return (
    <div style={styles.hud}>
      <div style={styles.hudLeft}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>分数</span>
          <span style={styles.statValue}>{gameState.score}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>关卡</span>
          <span style={styles.statValue}>{gameState.level}</span>
          <span style={styles.levelName}>{gameState.currentLevelConfig?.name}</span>
        </div>
      </div>

      <div style={styles.hudCenter}>
        <button style={styles.pauseButton} onClick={onPause}>
          ⏸ 暂停
        </button>
      </div>

      <div style={styles.hudRight}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>生命</span>
          <div style={styles.livesContainer}>
            {Array.from({ length: gameState.lives }).map((_, i) => (
              <span key={i} style={styles.heart}>❤️</span>
            ))}
          </div>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>敌人</span>
          <span style={styles.statValue}>{gameState.enemiesRemaining}</span>
        </div>
      </div>
    </div>
  );
};

interface MenuOverlayProps {
  onStart: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ onStart }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.menuContainer}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>🎖️</span>
          坦克大战
          <span style={styles.titleIcon}>🎖️</span>
        </h1>
        <p style={styles.subtitle}>经典街机游戏重现</p>
        
        <div style={styles.controls}>
          <h3 style={styles.controlsTitle}>操作说明</h3>
          <div style={styles.controlRow}>
            <span style={styles.key}>W A S D</span>
            <span style={styles.controlDesc}>移动坦克</span>
          </div>
          <div style={styles.controlRow}>
            <span style={styles.key}>空格</span>
            <span style={styles.controlDesc}>发射子弹</span>
          </div>
          <div style={styles.controlRow}>
            <span style={styles.key}>P</span>
            <span style={styles.controlDesc}>暂停游戏</span>
          </div>
        </div>

        <button style={styles.startButton} onClick={onStart}>
          开始游戏
        </button>

        <div style={styles.powerUpInfo}>
          <h4 style={styles.powerUpTitle}>道具说明</h4>
          <div style={styles.powerUpGrid}>
            <div style={styles.powerUpItem}>
              <span style={{ ...styles.powerUpIcon, backgroundColor: '#e91e63' }}>+</span>
              <span>恢复生命</span>
            </div>
            <div style={styles.powerUpItem}>
              <span style={{ ...styles.powerUpIcon, backgroundColor: '#2196f3' }}>»</span>
              <span>速度提升</span>
            </div>
            <div style={styles.powerUpItem}>
              <span style={{ ...styles.powerUpIcon, backgroundColor: '#ff9800' }}>!</span>
              <span>伤害提升</span>
            </div>
            <div style={styles.powerUpItem}>
              <span style={{ ...styles.powerUpIcon, backgroundColor: '#9c27b0' }}>◊</span>
              <span>护盾保护</span>
            </div>
            <div style={styles.powerUpItem}>
              <span style={{ ...styles.powerUpIcon, backgroundColor: '#00bcd4' }}>≡</span>
              <span>快速射击</span>
            </div>
            <div style={styles.powerUpItem}>
              <span style={{ ...styles.powerUpIcon, backgroundColor: '#795548' }}>✸</span>
              <span>清屏炸弹</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume, onRestart }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.pauseContainer}>
        <h2 style={styles.pauseTitle}>游戏暂停</h2>
        <div style={styles.buttonGroup}>
          <button style={styles.resumeButton} onClick={onResume}>
            继续游戏
          </button>
          <button style={styles.restartButton} onClick={onRestart}>
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverOverlayProps {
  score: number;
  level: number;
  onRestart: () => void;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, level, onRestart }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.gameOverContainer}>
        <h2 style={styles.gameOverTitle}>游戏结束</h2>
        <div style={styles.statsContainer}>
          <div style={styles.finalStat}>
            <span style={styles.finalStatLabel}>最终分数</span>
            <span style={styles.finalStatValue}>{score}</span>
          </div>
          <div style={styles.finalStat}>
            <span style={styles.finalStatLabel}>到达关卡</span>
            <span style={styles.finalStatValue}>{level}</span>
          </div>
        </div>
        <button style={styles.restartButton} onClick={onRestart}>
          再来一局
        </button>
      </div>
    </div>
  );
};

interface VictoryOverlayProps {
  level: number;
  score: number;
  levelName: string;
  onNextLevel: () => void;
}

const VictoryOverlay: React.FC<VictoryOverlayProps> = ({ level, score, levelName, onNextLevel }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.victoryContainer}>
        <h2 style={styles.victoryTitle}>🎉 关卡 {level} 完成！🎉</h2>
        <p style={styles.levelDescription}>{levelName}</p>
        <div style={styles.statsContainer}>
          <div style={styles.finalStat}>
            <span style={styles.finalStatLabel}>当前分数</span>
            <span style={styles.finalStatValue}>{score}</span>
          </div>
        </div>
        <button style={styles.nextLevelButton} onClick={onNextLevel}>
          进入下一关
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 10,
  },
  hudLeft: {
    display: 'flex',
    gap: '20px',
  },
  hudCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  hudRight: {
    display: 'flex',
    gap: '20px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: COLORS.ui.text,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: COLORS.ui.primary,
    textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
  },
  levelName: {
    fontSize: '10px',
    color: 'rgba(0, 212, 255, 0.8)',
    marginLeft: '4px',
  },
  livesContainer: {
    display: 'flex',
    gap: '4px',
  },
  heart: {
    fontSize: '20px',
  },
  pauseButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: COLORS.ui.text,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(5px)',
    zIndex: 20,
  },
  menuContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
    borderRadius: '20px',
    border: '2px solid rgba(0, 212, 255, 0.3)',
    boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)',
    maxWidth: '500px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: COLORS.ui.primary,
    textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
    margin: '0 0 10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  titleIcon: {
    fontSize: '36px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '30px',
  },
  controls: {
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
  },
  controlsTitle: {
    fontSize: '18px',
    color: COLORS.ui.text,
    marginBottom: '15px',
  },
  controlRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '10px',
  },
  key: {
    display: 'inline-block',
    padding: '5px 12px',
    background: 'rgba(0, 212, 255, 0.2)',
    border: '1px solid rgba(0, 212, 255, 0.5)',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: COLORS.ui.primary,
    minWidth: '80px',
  },
  controlDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
  },
  startButton: {
    padding: '15px 50px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 20px rgba(0, 212, 255, 0.4)',
    marginBottom: '20px',
  },
  powerUpInfo: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
  },
  powerUpTitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '10px',
  },
  powerUpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  powerUpItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  powerUpIcon: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pauseContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
    borderRadius: '20px',
    border: '2px solid rgba(0, 212, 255, 0.3)',
  },
  pauseTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: COLORS.ui.primary,
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  resumeButton: {
    padding: '12px 40px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  restartButton: {
    padding: '12px 40px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  gameOverContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
    borderRadius: '20px',
    border: '2px solid rgba(239, 68, 68, 0.5)',
  },
  gameOverTitle: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: COLORS.ui.danger,
    textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
    marginBottom: '30px',
  },
  statsContainer: {
    marginBottom: '30px',
  },
  finalStat: {
    marginBottom: '15px',
  },
  finalStatLabel: {
    display: 'block',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '5px',
  },
  finalStatValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: COLORS.ui.primary,
  },
  victoryContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
    borderRadius: '20px',
    border: '2px solid rgba(34, 197, 94, 0.5)',
  },
  victoryTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: COLORS.ui.success,
    textShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
    marginBottom: '10px',
  },
  levelDescription: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '20px',
  },
  nextLevelButton: {
    padding: '12px 40px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 20px rgba(0, 212, 255, 0.4)',
  },
};
