import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState, PlayerState, CharacterType, Position, Velocity, Collectible, Enemy } from '@/types/game';
import { getLevel } from '@/data/levels';
import { getCharacter } from '@/data/characters';
import { useSoundEffects } from './useSoundEffects';

const GRAVITY = 0.6;
const TERMINAL_VELOCITY = 15;
const FRICTION = 0.85;
const INVULNERABILITY_TIME = 1500;

const initialPlayerState: PlayerState = {
  position: { x: 100, y: 400 },
  velocity: { vx: 0, vy: 0 },
  isGrounded: false,
  isJumping: false,
  facingRight: true,
  isMoving: false,
  health: 3,
  maxHealth: 3,
  coins: 0,
  stars: 0,
  isInvulnerable: false,
};

const initialGameState: GameState = {
  currentLevel: 1,
  selectedCharacter: 'oneal',
  player: initialPlayerState,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  isLevelComplete: false,
  isVictory: false,
  score: 0,
  lives: 3,
  totalCoins: 0,
  totalStars: 0,
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [cameraOffset, setCameraOffset] = useState(0);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const mobileInputs = useRef<{ left: boolean; right: boolean; jump: boolean; dash: boolean }>({
    left: false,
    right: false,
    jump: false,
    dash: false,
  });
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const doubleJumpAvailable = useRef(true);
  const dashCooldown = useRef(false);
  
  const sounds = useSoundEffects();

  const level = getLevel(gameState.currentLevel);
  const character = getCharacter(gameState.selectedCharacter);

  // Initialize level
  const initializeLevel = useCallback((levelId: number) => {
    const newLevel = getLevel(levelId);
    if (!newLevel) return;

    setCollectibles(newLevel.collectibles.map(c => ({ ...c, collected: false })));
    setEnemies(newLevel.enemies.map(e => ({ ...e })));
    setCameraOffset(0);
    doubleJumpAvailable.current = true;

    setGameState(prev => ({
      ...prev,
      currentLevel: levelId,
      player: {
        ...initialPlayerState,
        position: { ...newLevel.playerStart },
        health: prev.player.health,
        coins: prev.player.coins,
        stars: prev.player.stars,
      },
      isLevelComplete: false,
      isGameOver: false,
    }));
  }, []);

  // Start game
  const startGame = useCallback((characterId: CharacterType) => {
    setGameState(prev => ({
      ...initialGameState,
      selectedCharacter: characterId,
      isPlaying: true,
    }));
    initializeLevel(1);
  }, [initializeLevel]);

  // Pause/Resume
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // Restart level
  const restartLevel = useCallback(() => {
    initializeLevel(gameState.currentLevel);
    setGameState(prev => ({
      ...prev,
      player: {
        ...initialPlayerState,
        position: level ? { ...level.playerStart } : { x: 100, y: 400 },
      },
      isGameOver: false,
      isLevelComplete: false,
      isPaused: false,
    }));
  }, [gameState.currentLevel, initializeLevel, level]);

  // Next level
  const nextLevel = useCallback(() => {
    const nextLevelId = gameState.currentLevel + 1;
    if (nextLevelId <= 10) {
      // Accumulate totals before moving to next level
      setGameState(prev => ({
        ...prev,
        totalCoins: prev.totalCoins + prev.player.coins,
        totalStars: prev.totalStars + prev.player.stars,
      }));
      initializeLevel(nextLevelId);
      setGameState(prev => ({ ...prev, isPaused: false }));
    } else {
      // Game complete - show victory screen
      setGameState(prev => ({
        ...prev,
        isVictory: true,
        isLevelComplete: false,
        totalCoins: prev.totalCoins + prev.player.coins,
        totalStars: prev.totalStars + prev.player.stars,
      }));
    }
  }, [gameState.currentLevel, initializeLevel]);

  // Mobile input trigger
  const triggerMobileInput = useCallback((action: 'left' | 'right' | 'jump' | 'dash', pressed: boolean) => {
    mobileInputs.current[action] = pressed;
    // Auto-release jump and dash after triggering
    if ((action === 'jump' || action === 'dash') && pressed) {
      setTimeout(() => {
        mobileInputs.current[action] = false;
      }, 100);
    }
  }, []);

  // Select level from menu
  const selectLevel = useCallback((levelId: number) => {
    initializeLevel(levelId);
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));
  }, [initializeLevel]);

  // Check collision between two rectangles
  const checkCollision = (
    pos1: Position, w1: number, h1: number,
    pos2: Position, w2: number, h2: number
  ) => {
    return (
      pos1.x < pos2.x + w2 &&
      pos1.x + w1 > pos2.x &&
      pos1.y < pos2.y + h2 &&
      pos1.y + h1 > pos2.y
    );
  };

  // Handle taking damage
  const takeDamage = useCallback(() => {
    setGameState(prev => {
      if (prev.player.isInvulnerable) return prev;
      
      sounds.playDamageSound();
      
      const newHealth = prev.player.health - 1;
      if (newHealth <= 0) {
        sounds.playGameOverSound();
        return {
          ...prev,
          player: { ...prev.player, health: 0 },
          isGameOver: true,
        };
      }

      setTimeout(() => {
        setGameState(p => ({
          ...p,
          player: { ...p.player, isInvulnerable: false },
        }));
      }, INVULNERABILITY_TIME);

      return {
        ...prev,
        player: {
          ...prev.player,
          health: newHealth,
          isInvulnerable: true,
        },
      };
    });
  }, [sounds]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!level || gameState.isPaused || gameState.isGameOver || gameState.isLevelComplete) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (deltaTime > 100) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    setGameState(prev => {
      if (!prev.isPlaying) return prev;

      let { position, velocity, isGrounded, facingRight } = prev.player;
      let newVx = velocity.vx;
      let newVy = velocity.vy;

      // Input handling - keyboard and mobile
      const moveLeft = keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || mobileInputs.current.left;
      const moveRight = keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || mobileInputs.current.right;
      const jump = keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has(' ') || mobileInputs.current.jump;
      const dash = keysPressed.current.has('Shift') || mobileInputs.current.dash;

      // Movement
      if (moveLeft) {
        newVx = -character.speed;
        facingRight = false;
      } else if (moveRight) {
        newVx = character.speed;
        facingRight = true;
      } else {
        newVx *= FRICTION;
      }

      // Jumping
      if (jump && isGrounded) {
        newVy = -character.jumpPower;
        isGrounded = false;
        doubleJumpAvailable.current = prev.selectedCharacter === 'badju';
        sounds.playJumpSound();
        keysPressed.current.delete('ArrowUp');
        keysPressed.current.delete('w');
        keysPressed.current.delete(' ');
        mobileInputs.current.jump = false;
      } else if (jump && !isGrounded && doubleJumpAvailable.current && prev.selectedCharacter === 'badju') {
        newVy = -character.jumpPower * 0.85;
        doubleJumpAvailable.current = false;
        sounds.playDoubleJumpSound();
        keysPressed.current.delete('ArrowUp');
        keysPressed.current.delete('w');
        keysPressed.current.delete(' ');
        mobileInputs.current.jump = false;
      }

      // Dash ability for Christo
      if (dash && prev.selectedCharacter === 'tibat' && !dashCooldown.current) {
        newVx = facingRight ? 15 : -15;
        dashCooldown.current = true;
        sounds.playDashSound();
        setTimeout(() => { dashCooldown.current = false; }, 800);
        keysPressed.current.delete('Shift');
        mobileInputs.current.dash = false;
      }

      // Apply gravity
      newVy += GRAVITY;
      if (newVy > TERMINAL_VELOCITY) newVy = TERMINAL_VELOCITY;

      // Calculate new position
      let newX = position.x + newVx;
      let newY = position.y + newVy;

      // Platform collision
      const playerWidth = 40;
      const playerHeight = 50;
      let groundedThisFrame = false;

      for (const platform of level.platforms) {
        // Check vertical collision (landing on platform)
        if (
          newVy > 0 &&
          position.y + playerHeight <= platform.y &&
          newY + playerHeight >= platform.y &&
          newX + playerWidth > platform.x &&
          newX < platform.x + platform.width
        ) {
          newY = platform.y - playerHeight;
          newVy = 0;
          groundedThisFrame = true;
          doubleJumpAvailable.current = prev.selectedCharacter === 'badju';
        }

        // Check horizontal collision
        if (
          newY + playerHeight > platform.y &&
          newY < platform.y + platform.height
        ) {
          // Hitting from left
          if (newVx > 0 && position.x + playerWidth <= platform.x && newX + playerWidth > platform.x) {
            newX = platform.x - playerWidth;
            newVx = 0;
          }
          // Hitting from right
          if (newVx < 0 && position.x >= platform.x + platform.width && newX < platform.x + platform.width) {
            newX = platform.x + platform.width;
            newVx = 0;
          }
        }

        // Check hitting head
        if (
          newVy < 0 &&
          position.y >= platform.y + platform.height &&
          newY < platform.y + platform.height &&
          newX + playerWidth > platform.x &&
          newX < platform.x + platform.width
        ) {
          newY = platform.y + platform.height;
          newVy = 0;
        }
      }

      isGrounded = groundedThisFrame;

      // Boundary checks
      if (newX < 0) newX = 0;
      if (newX > level.width - playerWidth) newX = level.width - playerWidth;
      
      // Fall off bottom - take damage and reset
      if (newY > level.height + 100) {
        takeDamage();
        return {
          ...prev,
          player: {
            ...prev.player,
            position: { ...level.playerStart },
            velocity: { vx: 0, vy: 0 },
            isGrounded: false,
          },
        };
      }

      // Update camera
      const viewportWidth = 800;
      let newCameraOffset = newX - viewportWidth / 2 + playerWidth / 2;
      if (newCameraOffset < 0) newCameraOffset = 0;
      if (newCameraOffset > level.width - viewportWidth) newCameraOffset = level.width - viewportWidth;
      setCameraOffset(newCameraOffset);

      return {
        ...prev,
        player: {
          ...prev.player,
          position: { x: newX, y: newY },
          velocity: { vx: newVx, vy: newVy },
          isGrounded,
          facingRight,
          isMoving: Math.abs(newVx) > 0.5,
          isJumping: !isGrounded,
        },
      };
    });

    // Enemy movement and collision
    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        let newX = enemy.x + enemy.speed * enemy.direction;
        let newDirection = enemy.direction;

        if (enemy.patrolStart !== undefined && enemy.patrolEnd !== undefined) {
          if (newX <= enemy.patrolStart || newX >= enemy.patrolEnd) {
            newDirection = enemy.direction === 1 ? -1 : 1;
          }
        }

        // Check collision with player
        const playerPos = gameState.player.position;
        if (checkCollision(playerPos, 40, 50, { x: newX, y: enemy.y }, enemy.width, enemy.height)) {
          takeDamage();
        }

        return {
          ...enemy,
          x: newX,
          direction: newDirection as 1 | -1,
        };
      });
    });

    // Collectible collision
    setCollectibles(prevCollectibles => {
      return prevCollectibles.map(collectible => {
        if (collectible.collected) return collectible;

        const playerPos = gameState.player.position;
        if (checkCollision(playerPos, 40, 50, { x: collectible.x, y: collectible.y }, 30, 30)) {
          // Play appropriate sound
          if (collectible.type === 'coin') {
            sounds.playCoinSound();
          } else if (collectible.type === 'star') {
            sounds.playStarSound();
          } else if (collectible.type === 'heart') {
            sounds.playHeartSound();
          }
          
          setGameState(prev => {
            let newState = { ...prev };
            if (collectible.type === 'coin') {
              newState.player = { ...prev.player, coins: prev.player.coins + collectible.value };
              newState.score = prev.score + collectible.value;
            } else if (collectible.type === 'star') {
              newState.player = { ...prev.player, stars: prev.player.stars + 1 };
              newState.score = prev.score + collectible.value;
            } else if (collectible.type === 'heart') {
              newState.player = {
                ...prev.player,
                health: Math.min(prev.player.maxHealth, prev.player.health + 1),
              };
            }
            return newState;
          });
          return { ...collectible, collected: true };
        }
        return collectible;
      });
    });

    // Portal collision (level complete)
    if (level.portal) {
      const playerPos = gameState.player.position;
      if (checkCollision(playerPos, 40, 50, { x: level.portal.x, y: level.portal.y }, 60, 80)) {
        sounds.playLevelCompleteSound();
        setGameState(prev => ({ ...prev, isLevelComplete: true }));
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [level, gameState.isPaused, gameState.isGameOver, gameState.isLevelComplete, gameState.player.position, character, takeDamage, sounds]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      
      // Prevent default for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Pause with Escape
      if (e.key === 'Escape' && gameState.isPlaying) {
        if (gameState.isPaused) {
          resumeGame();
        } else {
          pauseGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isPaused, pauseGame, resumeGame]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.isPlaying) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameLoop]);

  return {
    gameState,
    level,
    character,
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
  };
};
