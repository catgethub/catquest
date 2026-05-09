import { Character } from '@/types/game';

export const characters: Record<string, Character> = {
  badju: {
    id: 'badju',
    name: 'Badju',
    description: 'A skilled plumber with the power of double jump. Strong and unstoppable!',
    color: 'destructive',
    ability: 'Double Jump',
    speed: 4,
    jumpPower: 14,
  },
  mark: {
    id: 'mark',
    name: 'Mark',
    description: 'A fiery speedster who can dash through enemies. Great for aggressive playstyles!',
    color: 'accent',
    ability: 'Fire Dash',
    speed: 7,
    jumpPower: 14,
  },
  oneal: {
    id: 'oneal',
    name: 'Oneal',
    description: 'A tactical soldier who can glide with a parachute. Perfect for strategic landings!',
    color: 'foreground',
    ability: 'Glide',
    speed: 5,
    jumpPower: 14,
  },
  teri: {
    id: 'teri',
    name: 'Teri',
    description: 'A nimble climber who can scale walls with ease. Great for vertical exploration!',
    color: 'primary',
    ability: 'Wall Climb',
    speed: 6,
    jumpPower: 14,
  },
};

export const getCharacter = (id: string): Character => {
  return characters[id] || characters.badju;
};
