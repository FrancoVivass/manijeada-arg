import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Achievement, UserProfile } from '../models/game.models';
import { AuthService } from './auth.service';
import { ACHIEVEMENTS } from '../data/game-data';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  allAchievements = signal<Achievement[]>([]);

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    this.allAchievements.set(ACHIEVEMENTS as Achievement[]);
  }

  async checkAndUnlock(achievementId: string) {
    const user = this.auth.currentUser();
    if (!user) return;

    // Check if achievement exists in our local list first
    const ach = this.allAchievements().find(a => a.id === achievementId);
    if (!ach) return;

    try {
      const { data: existing } = await this.supabase.from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .maybeSingle();

      if (!existing) {
        await this.supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievementId
        });
        
        // In a real UI we would show a toast/modal
        console.log(`%c ¡LOGRO DESBLOQUEADO: ${ach.name}! `, 'background: #00ffff; color: #000; font-weight: bold;');
        return ach;
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
    return null;
  }

  async getUserAchievements(userId: string) {
    const { data, error } = await this.supabase.from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
    
    if (error) return [];
    
    // Map IDs to actual Achievement objects
    return this.allAchievements().filter(ach =>
      data.some((ua: any) => ua.achievement_id === ach.id)
    );
  }

  async getRecentAchievements(userId: string, limit: number = 3) {
    const { data, error } = await this.supabase.from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(limit);

    if (error) return [];

    return this.allAchievements().filter(ach =>
      data.some((ua: any) => ua.achievement_id === ach.id)
    );
  }
}
