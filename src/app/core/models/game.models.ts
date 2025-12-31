export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  total_shots: number;
  shame_level: number;
  created_at?: string;
}

export interface Game {
  id: string;
  host_id: string;
  join_code: string;
  status: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';
  mode: GameMode;
  current_turn_player_id?: string;
  created_at?: string;
  settings: GameSettings;
  game_type?: 'ROULETTE' | 'CARDS' | 'IMPOSTOR';
}

export type GameMode = 'PREVIA' | 'NORMAL' | 'TRANQUI' | 'EXTREMO' | 'CUSTOM' | 'PICANTE' | 'BORRACHERA' | 'CAOS' | 'DESCONTROL' | 'APOCALIPSIS' | 'FIESTA INFINITA' | 'MAYOR_MENOR' | 'ROJO_NEGRO' | 'PIRAMIDE' | 'SIETE_LOCO';

export interface GameSettings {
  chaos_level: number;
  legendary_enabled: boolean;
  categories: string[];
  pyramid_size?: number;
  starting_shots?: number;
  game_type?: 'ROULETTE' | 'CARDS' | 'IMPOSTOR';
}

export interface Player {
  id: string;
  game_id: string;
  user_id?: string;
  display_name: string;
  shots_count: number;
  is_active: boolean;
  is_guest: boolean;
  joined_at?: string;
}

export interface Challenge {
  id: string;
  text: string;
  category: ChallengeCategory;
  intensity: number;
  penalty_shots: number;
  is_legendary: boolean;
}

export type ChallengeCategory = 'SOCIAL' | 'VERGONZOSO' | 'FISICO' | 'MENTAL' | 'GRUPO' | 'ALCOHOL' | 'CAOS' | 'EXTREMO';

export interface Drink {
  id: string;
  text: string;
  type: 'SIMPLE' | 'PROGRESSIVE' | 'CONDITIONAL' | 'SOCIAL' | 'SHARED' | 'TEMPORAL';
  shots: number;
}

export interface GameSessionAction {
  id: string;
  game_id: string;
  player_id: string;
  action_type: 'SHOT' | 'CHALLENGE' | 'LOGRO';
  action_description: string;
  was_completed: boolean;
  penalty_applied: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  reward_type?: 'SKIP_SHOT' | 'REDUCE_SHOTS' | 'CANCEL_CHALLENGE' | 'IMMUNITY' | 'TRANSFER';
  icon?: string;
}

export interface RouletteOption {
  id: string;
  label: string;
  color: string;
  type: string;
}

