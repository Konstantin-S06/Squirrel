// Avatar types and configuration

export interface AvatarParts {
  body: string;
  eyes: string;
  mouth: string;
  accessory: string;
  background: string;
}

export interface AvatarItem {
  id: string;
  category: 'body' | 'eyes' | 'mouth' | 'accessory' | 'background';
  name: string;
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Default avatar parts
export const DEFAULT_AVATAR: AvatarParts = {
  body: 'default',
  eyes: 'normal',
  mouth: 'smile',
  accessory: 'none',
  background: 'transparent'
};

// Avatar shop catalog
export const AVATAR_CATALOG: AvatarItem[] = [
  // Bodies
  { id: 'body_default', category: 'body', name: 'Classic Squirrel', cost: 0, rarity: 'common' },
  { id: 'body_chubby', category: 'body', name: 'Chubby Squirrel', cost: 100, rarity: 'common' },
  { id: 'body_athletic', category: 'body', name: 'Athletic Squirrel', cost: 200, rarity: 'rare' },
  { id: 'body_fluffy', category: 'body', name: 'Fluffy Squirrel', cost: 300, rarity: 'rare' },
  { id: 'body_ninja', category: 'body', name: 'Ninja Squirrel', cost: 500, rarity: 'epic' },

  // Eyes
  { id: 'eyes_normal', category: 'eyes', name: 'Normal Eyes', cost: 0, rarity: 'common' },
  { id: 'eyes_happy', category: 'eyes', name: 'Happy Eyes', cost: 50, rarity: 'common' },
  { id: 'eyes_sparkle', category: 'eyes', name: 'Sparkle Eyes', cost: 150, rarity: 'rare' },
  { id: 'eyes_laser', category: 'eyes', name: 'Laser Eyes', cost: 400, rarity: 'epic' },
  { id: 'eyes_star', category: 'eyes', name: 'Star Eyes', cost: 600, rarity: 'legendary' },

  // Mouths
  { id: 'mouth_smile', category: 'mouth', name: 'Smile', cost: 0, rarity: 'common' },
  { id: 'mouth_grin', category: 'mouth', name: 'Big Grin', cost: 50, rarity: 'common' },
  { id: 'mouth_tongue', category: 'mouth', name: 'Tongue Out', cost: 100, rarity: 'rare' },
  { id: 'mouth_fangs', category: 'mouth', name: 'Fangs', cost: 300, rarity: 'epic' },

  // Accessories
  { id: 'acc_none', category: 'accessory', name: 'None', cost: 0, rarity: 'common' },
  { id: 'acc_cap', category: 'accessory', name: 'Baseball Cap', cost: 100, rarity: 'common' },
  { id: 'acc_crown', category: 'accessory', name: 'Crown', cost: 300, rarity: 'rare' },
  { id: 'acc_wizard', category: 'accessory', name: 'Wizard Hat', cost: 500, rarity: 'epic' },
  { id: 'acc_halo', category: 'accessory', name: 'Halo', cost: 800, rarity: 'legendary' },
  { id: 'acc_headphones', category: 'accessory', name: 'Headphones', cost: 200, rarity: 'rare' },

  // Backgrounds
  { id: 'bg_sky', category: 'background', name: 'Sky Blue', cost: 0, rarity: 'common' },
  { id: 'bg_sunset', category: 'background', name: 'Sunset', cost: 100, rarity: 'common' },
  { id: 'bg_forest', category: 'background', name: 'Forest', cost: 150, rarity: 'rare' },
  { id: 'bg_galaxy', category: 'background', name: 'Galaxy', cost: 400, rarity: 'epic' },
  { id: 'bg_gold', category: 'background', name: 'Golden', cost: 700, rarity: 'legendary' },
];

// Color mapping for backgrounds
export const BACKGROUND_COLORS: Record<string, string> = {
  transparent: 'transparent',
  bg_sky: '#87CEEB',
  bg_sunset: '#FF6B6B',
  bg_forest: '#2D5016',
  bg_galaxy: '#1A1A2E',
  bg_gold: '#FFD700'
};

// Rarity colors
export const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#4FC3F7',
  epic: '#AB47BC',
  legendary: '#FFD700'
};
