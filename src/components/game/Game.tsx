import { useEffect, useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { MainMenu } from './MainMenu';
import { GameWorld } from './GameWorld';
import { GameHUD } from './GameHUD';
import { PauseMenu } from './PauseMenu';
import { GameOverScreen } from './GameOverScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { VictoryScreen } from './VictoryScreen';
import { MobileControls } from './MobileControls';

export const Game = () => {
  const {
    gameState,
    level,
    collectibles,
    enemies,
    cameraOffset,
    startGame,
    pauseGame,
    resumeGame,
    restartLevel,
    nextLevel,
    selectLevel,
    triggerMobileInput,
  } = useGameEngine();

  const { playMusic, stopMusic } = useMusicPlayer();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Handle music based on game state and level theme
  useEffect(() => {
    if (gameState.isPlaying && level && !gameState.isPaused && !gameState.isGameOver && !gameState.isLevelComplete) {
      playMusic(level.theme);
    } else if (gameState.isPaused || gameState.isGameOver || !gameState.isPlaying) {
      stopMusic();
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.isLevelComplete, level?.theme, playMusic, stopMusic]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!gameContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      await gameContainerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const handleMainMenu = () => {
    window.location.reload(); // Simple way to reset to main menu
  };

  if (!gameState.isPlaying) {
    return (
      <MainMenu 
        onStartGame={startGame} 
        onSelectLevel={(levelId) => {
          startGame('oneal');
          setTimeout(() => selectLevel(levelId), 100);
        }}
      />
    );
  }

  if (!level) {
    return <div className="text-foreground p-8">Loading level...</div>;
  }

  return (
    <div 
      ref={gameContainerRef}
      className={`min-h-screen flex items-center justify-center p-2 sm:p-4 bg-foreground/10 pb-24 md:pb-4 ${isFullscreen ? 'bg-black' : ''}`}
    >
      <div className="relative">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute -top-10 right-0 z-20 p-2 rounded-lg bg-background/80 hover:bg-background text-foreground transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        {/* Game World */}
        <GameWorld
          level={level}
          player={gameState.player}
          characterType={gameState.selectedCharacter}
          collectibles={collectibles}
          enemies={enemies}
          cameraOffset={cameraOffset}
        />

        {/* HUD */}
        <GameHUD
          player={gameState.player}
          score={gameState.score}
          levelName={level.name}
          onPause={pauseGame}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState.isPaused && !gameState.isGameOver && !gameState.isLevelComplete && (
            <PauseMenu
              onResume={resumeGame}
              onRestart={restartLevel}
              onMainMenu={handleMainMenu}
            />
          )}

          {gameState.isGameOver && (
            <GameOverScreen
              score={gameState.score}
              onRestart={restartLevel}
              onMainMenu={handleMainMenu}
            />
          )}

          {gameState.isLevelComplete && !gameState.isVictory && (
            <LevelCompleteScreen
              levelName={level.name}
              score={gameState.score}
              coins={gameState.player.coins}
              stars={gameState.player.stars}
              isLastLevel={gameState.currentLevel >= 10}
              onNextLevel={nextLevel}
              onRestart={restartLevel}
              onMainMenu={handleMainMenu}
            />
          )}

          {gameState.isVictory && (
            <VictoryScreen
              totalScore={gameState.score}
              totalCoins={gameState.totalCoins}
              totalStars={gameState.totalStars}
              levelsCompleted={10}
              onPlayAgain={handleMainMenu}
              onMainMenu={handleMainMenu}
            />
          )}
        </AnimatePresence>

        {/* Mobile Controls */}
        {!gameState.isPaused && !gameState.isGameOver && !gameState.isLevelComplete && (
          <MobileControls
            onLeftStart={() => triggerMobileInput('left', true)}
            onLeftEnd={() => triggerMobileInput('left', false)}
            onRightStart={() => triggerMobileInput('right', true)}
            onRightEnd={() => triggerMobileInput('right', false)}
            onJump={() => triggerMobileInput('jump', true)}
            onDash={() => triggerMobileInput('dash', true)}
            characterType={gameState.selectedCharacter}
          />
        )}

        {/* Desktop Controls Hint */}
        <div className="mt-4 text-center text-muted-foreground text-xs sm:text-sm hidden md:block">
          Use arrow keys or WASD to move • Space or ↑ to jump • ESC to pause
        </div>
      </div>
    </div>
  );
};
