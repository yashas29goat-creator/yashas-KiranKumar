export type PlayerPosition = 'GK' | 'LB' | 'CB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST' | 'CF';

export type CardRarity = 'TOTY' | 'ICON_PRIME' | 'UCL_HERO' | 'GALACTICO_GOLD' | 'FLASHBACK' | 'CUSTOM_FORGE';

export type TacticMode = 'DEF' | 'BAL' | 'ATT';

export type FormationType = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2';

export type CameraMode = 'broadcast' | 'action' | 'topdown';

export type WeatherMode = 'night_floodlights' | 'sunny' | 'rain_slick';

export type DifficultyLevel = 'Semi-Pro' | 'World Class' | 'Prime 123';

export interface PlayerStats {
  pac: number; // Pace / Speed
  sho: number; // Shooting
  pas: number; // Passing
  dri: number; // Dribbling
  def: number; // Defending
  phy: number; // Physical
  staminaMax: number;
  weakFoot: number; // 1-5
  skillMoves: number; // 1-5
}

export interface PlayerCard {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  position: PlayerPosition;
  rarity: CardRarity;
  photoUrl: string;
  club: string;
  clubBadge: string;
  nationality: string;
  flag: string;
  stats: PlayerStats;
  preferredFoot: 'Left' | 'Right';
  heightCm: number;
  traits: string[];
}

export interface MatchPlayer extends PlayerCard {
  team: 'home' | 'away';
  x: number; // Pitch coordinates (0 - 1100)
  y: number; // Pitch coordinates (0 - 720)
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  hasBall: boolean;
  stamina: number; // 0 - 100
  state: 'idle' | 'running' | 'sprinting' | 'shooting' | 'passing' | 'tackling' | 'celebrating' | 'goalkeeping' | 'stunned' | 'skill_move';
  skillCooldown: number;
  actionTimer: number;
  formationSlot: { x: number; y: number }; // Relative base slot (0-1)
  number: number;
  facingAngle: number;
}

export interface Ball {
  x: number;
  y: number;
  z: number; // Height above ground for 3D physics
  vx: number;
  vy: number;
  vz: number;
  spin: number;
  possessionPlayerId: string | null;
  lastPossessionTeam: 'home' | 'away' | null;
  lastTouchTime: number;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  badge: string;
  tactic: TacticMode;
  formation: FormationType;
  players: PlayerCard[];
  bench: PlayerCard[];
  rating: number;
}

export interface MatchStatistics {
  possession: number; // %
  shots: number;
  shotsOnTarget: number;
  xG: number;
  passesCompleted: number;
  passesAttempted: number;
  tacklesWon: number;
  tacklesAttempted: number;
  fouls: number;
  corners: number;
  offsides: number;
  saves: number;
}

export interface CommentaryItem {
  id: string;
  minute: number;
  text: string;
  type: 'goal' | 'shot' | 'save' | 'tackle' | 'foul' | 'kickoff' | 'halftime' | 'skill' | 'woodwork' | 'whistle' | 'info';
  timestamp: number;
}

export interface GoalWalkoutEvent {
  scorer: PlayerCard;
  assistBy?: PlayerCard;
  team: 'home' | 'away';
  minute: number;
  shotSpeedKmh: number;
  distanceMeters: number;
  executionStyle: string;
  scoreHome: number;
  scoreAway: number;
}

export interface PitchEmote {
  id: string;
  emoji: string;
  x: number;
  y: number;
  opacity: number;
  createdAt: number;
}

export interface UserEconomy {
  coins: number;
  gems: number;
  level: number;
  xp: number;
  inventory: PlayerCard[];
  activeSquad: PlayerCard[];
  activeFormation: FormationType;
}

export interface TransferListing {
  id: string;
  player: PlayerCard;
  currentBid: number;
  buyNowPrice: number;
  seller: string;
  expiresInSeconds: number;
  bidsCount: number;
}

export interface DraftPick {
  position: PlayerPosition;
  options: PlayerCard[];
  selected?: PlayerCard;
}
