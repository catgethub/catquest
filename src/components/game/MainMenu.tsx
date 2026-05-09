import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Map, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterType } from '@/types/game';
import { characters } from '@/data/characters';
import { levels } from '@/data/levels';

interface MainMenuProps {
  onStartGame: (character: CharacterType) => void;
  onSelectLevel: (level: number) => void;
}

export const MainMenu = ({ onStartGame, onSelectLevel }: MainMenuProps) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('oneal');
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const characterList = Object.values(characters);

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 gradient-sky">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Clouds */}
        <motion.div
          className="absolute top-20 w-32 h-12 bg-white/40 rounded-full"
          animate={{ x: [-100, window.innerWidth + 100] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ left: -100 }}
        />
        <motion.div
          className="absolute top-40 w-24 h-10 bg-white/30 rounded-full"
          animate={{ x: [-100, window.innerWidth + 100] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear", delay: 5 }}
          style={{ left: -100 }}
        />
        <motion.div
          className="absolute top-32 w-40 h-14 bg-white/35 rounded-full"
          animate={{ x: [-100, window.innerWidth + 100] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 10 }}
          style={{ left: -100 }}
        />
        
        {/* Floating sparkles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-card max-w-lg w-full relative z-10 mx-2"
      >
        {!showLevelSelect ? (
          <>
            {/* Title */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-shadow-game mb-2">
                <span className="text-primary">Cat</span>
                <span className="text-secondary">Quest</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">A Colorful Laborer Adventure</p>
            </motion.div>

            {/* Character Selection */}
            <div className="mb-4 sm:mb-6">
              <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                Choose Your Hero
              </h3>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {characterList.map((char) => (
                  <motion.button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id as CharacterType)}
                    className={`p-3 sm:p-4 rounded-xl border-2 sm:border-3 transition-all ${
                      selectedCharacter === char.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Character preview */}
                    <div className={`mx-auto mb-2 rounded-t-full rounded-b-lg relative overflow-hidden ${
                      char.id === 'badju' ? 'w-12 h-14 sm:w-14 sm:h-16 bg-destructive' : 
                      char.id === 'oneal' ? 'w-10 h-12 sm:w-12 sm:h-14 bg-foreground' : 
                      char.id === 'boyet' ? 'w-10 h-12 sm:w-12 sm:h-14 bg-primary' : 'w-10 h-12 sm:w-12 sm:h-14 bg-accent'
                    }`}>
                      {/* Lou's camo pattern */}
                      {char.id === 'oneal' && (
                        <>
                          <div className="absolute top-1 left-0.5 w-2 h-1.5 rounded-full" style={{ backgroundColor: '#556B2F' }} />
                          <div className="absolute top-3 right-0 w-2.5 h-2 rounded-full" style={{ backgroundColor: '#6B8E23' }} />
                          <div className="absolute top-6 left-1 w-3 h-1.5 rounded-full" style={{ backgroundColor: '#4A5D23' }} />
                        </>
                      )}
                      {/* Eyes */}
                      <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
                        <div className="w-1.5 h-2 sm:w-2 sm:h-2.5 bg-card rounded-full" />
                        <div className="w-1.5 h-2 sm:w-2 sm:h-2.5 bg-card rounded-full" />
                      </div>
                      {/* Character-specific accessories */}
                      {char.id === 'badju' && (
                        <>
                          {/* Plumber cap */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                            <div className="w-6 h-2.5 bg-red-600 rounded-t-full" />
                            <div className="w-7 h-1 bg-red-700 rounded-full -mt-0.5" />
                            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-white rounded-full" />
                          </div>
                          {/* Wrench */}
                          <div className="absolute top-4 -right-2.5 transform rotate-45">
                            {/* Handle */}
                            <div className="w-1.5 h-6 bg-gray-500 rounded-full" />
                            {/* Wrench head */}
                            <div className="absolute -top-1 -left-1 w-3.5 h-2.5 bg-gray-400 rounded-sm" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)' }}>
                              <div className="absolute top-0.5 left-0.5 w-1 h-1.5 bg-gray-600 rounded-sm" />
                            </div>
                          </div>
                        </>
                      )}
                      {char.id === 'tibat' && (
                        <>
                          {/* Dreadlocks */}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            <div className="w-1 h-4 bg-amber-900 rounded-full transform -rotate-12" />
                            <div className="w-1 h-5 bg-amber-800 rounded-full transform -rotate-6" />
                            <div className="w-1 h-4 bg-amber-900 rounded-full" />
                            <div className="w-1 h-5 bg-amber-800 rounded-full transform rotate-6" />
                            <div className="w-1 h-4 bg-amber-900 rounded-full transform rotate-12" />
                          </div>
                        </>
                      )}
                      {char.id === 'oneal' && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-t-full" style={{ backgroundColor: '#556B2F' }} />
                      )}
                      {char.id === 'boyet' && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-destructive/80 rounded-full" />
                      )}
                    </div>
                    
                    <h4 className="font-display font-bold text-foreground text-sm sm:text-base">{char.name}</h4>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                      {char.id === 'badju' ? (
                        <Sparkles className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">{char.ability}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-2 line-clamp-2 hidden sm:block">{char.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <Button
                onClick={() => onStartGame(selectedCharacter)}
                className="game-button bg-primary text-primary-foreground hover:bg-primary/90 w-full text-lg sm:text-xl py-4 sm:py-6"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Start Adventure
              </Button>
              
              <Button
                onClick={() => setShowLevelSelect(true)}
                variant="secondary"
                className="game-button bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full py-3 sm:py-4"
              >
                <Map className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Select Level
              </Button>
            </div>

            {/* Controls hint - desktop only */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-xl hidden sm:block">
              <h4 className="font-display font-semibold text-sm text-foreground mb-2">Controls</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>← → or A/D: Move</div>
                <div>↑, W or Space: Jump</div>
                <div>Shift: {selectedCharacter === 'badju' ? 'Double Jump (in air)' : 'Fire Dash'}</div>
                <div>ESC: Pause</div>
              </div>
            </div>
            
            {/* Mobile controls hint */}
            <div className="mt-4 p-3 bg-muted/50 rounded-xl sm:hidden">
              <p className="text-xs text-muted-foreground text-center">
                Use on-screen controls to play
              </p>
            </div>
          </>
        ) : (
          /* Level Selection */
          <>
            <button
              onClick={() => setShowLevelSelect(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </button>
            
            <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Map className="w-6 h-6" />
              Select Level
            </h2>
            
            <div className="flex flex-col gap-3">
              {levels.map((level) => (
                <motion.button
                  key={level.id}
                  onClick={() => onSelectLevel(level.id)}
                  className="p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">Level {level.id}</span>
                      <h3 className="font-display font-bold text-lg text-foreground">{level.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{level.theme} theme</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
