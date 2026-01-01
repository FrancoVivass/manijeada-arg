import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Game, Player, GameMode, GameSettings } from '../models/game.models';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  currentGame = signal<Game | null>(null);
  players = signal<Player[]>([]);
  
  private playersSubject = new BehaviorSubject<Player[]>([]);

  constructor(
    public supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async createGame(mode: GameMode | any = 'NORMAL', settings?: any) {
    let user = this.auth.currentUser();

    if (!user) {
      const { data } = await this.auth.supabase.auth.getUser();
      user = data.user;
      if (user) this.auth.currentUser.set(user);
    }

    if (!user) throw new Error('User not logged in');

    await this.auth.ensureUserProfile(user);

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const defaultSettings: GameSettings = {
      chaos_level: 5,
      legendary_enabled: true,
      categories: ['SOCIAL', 'VERGONZOSO', 'FISICO', 'MENTAL', 'ALCOHOL', 'GRUPO', 'CAOS']
    };

    // Extraer game_type de settings si existe
    const gameType = settings?.game_type || 'ROULETTE';

    const gamePayload: any = {
      host_id: user!.id,
      join_code: joinCode,
      game_type: gameType,
      mode: mode,
      status: 'LOBBY',
      settings: settings || defaultSettings
    };

    const { data: game, error } = await this.supabase.from('games').insert(gamePayload).select().single();

    if (error) throw error;

    const displayName = user?.user_metadata?.['display_name'] || user?.email?.split('@')[0] || 'Host';
    const hostPlayer = await this.addPlayerToGame(game.id, user!.id, displayName);
    
    // Set initial turn to host
    await this.supabase.from('games')
      .update({ current_turn_player_id: hostPlayer.id })
      .eq('id', game.id);

    return game;
  }

  async addPlayerToGame(gameId: string, userId: string, displayName: string) {
    const payload: any = {
      game_id: gameId,
      display_name: displayName,
      user_id: userId,
      is_guest: false
    };

    const { data: player, error } = await this.supabase.from('players').upsert(payload, { onConflict: 'game_id,user_id' }).select().single();
    if (error) throw error;
    this.subscribeToGame(gameId);
    return player;
  }


  async getGameByCode(code: string) {
    const { data, error } = await this.supabase.from('games')
      .select('*')
      .eq('join_code', code.toUpperCase())
      .single();
    
    if (error) return null;
    return data as Game;
  }

  private subscribeToGame(gameId: string) {
    this.refreshPlayers(gameId);

    this.supabase.client
      .channel(`game_room:${gameId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'players',
        filter: `game_id=eq.${gameId}` 
      }, () => {
        this.refreshPlayers(gameId);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, (payload: any) => {
        this.currentGame.set(payload.new as Game);
      })
      .subscribe();
  }

  async refreshPlayers(gameId: string) {
    const { data, error } = await this.supabase.from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true });
    
    if (error) console.error('Error refreshing players:', error);
    
    if (data) {
      this.players.set(data as Player[]);
      this.playersSubject.next(data as Player[]);
    }
  }

  getPlayersObservable(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  async startGame(gameId: string) {
    // CORRECCIÓN: Filtro por game_id, no por id
    const { data: players, error: pError } = await this.supabase.from('players')
      .select('id')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true });
    
    if (pError) throw pError;

    const update: any = { status: 'IN_PROGRESS' };
    if (players && players.length > 0) {
      update.current_turn_player_id = players[0].id;
    }

    const { error } = await this.supabase.from('games')
      .update(update)
      .eq('id', gameId);
    
    if (error) throw error;
  }
}
