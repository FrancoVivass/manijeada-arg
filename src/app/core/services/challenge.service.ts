import { Injectable } from '@angular/core';
import { Challenge, Drink, ChallengeCategory, GameMode } from '../models/game.models';
import { CHALLENGES, DRINKS } from '../data/game-data';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private challenges: Challenge[] = [];
  private drinks: Drink[] = [];

  constructor(private supabase: SupabaseService) {
    this.challenges = CHALLENGES.map((c, index) => ({
      ...c,
      id: `c-${index}`,
      is_legendary: c.category === 'EXTREMO' || Math.random() < 0.05
    } as Challenge));

    this.drinks = DRINKS.map((d, index) => ({
      ...d,
      id: `d-${index}`
    } as Drink));
  }

  getRandomChallenge(mode: GameMode, categories: string[]): Challenge {
    let filtered = this.challenges.filter(c => categories.includes(c.category));
    if (filtered.length === 0) filtered = this.challenges;
    
    const maxIntensity = this.getMaxIntensity(mode);
    filtered = filtered.filter(c => c.intensity <= maxIntensity);

    if (filtered.length === 0) filtered = this.challenges;

    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  getRandomDrink(): Drink {
    return this.drinks[Math.floor(Math.random() * this.drinks.length)];
  }

  private getMaxIntensity(mode: GameMode): number {
    switch(mode) {
      case 'TRANQUI': return 4;
      case 'NORMAL': return 6;
      case 'PICANTE': return 8;
      case 'CAOS': return 9;
      case 'APOCALIPSIS': return 10;
      default: return 6;
    }
  }

  async generateDynamicChallenge(mode: GameMode): Promise<Challenge> {
    const verbs = ["Baila", "Canta", "Grita", "Imita a", "Confiesa", "Llama a", "Muestra", "Dibuja", "Escribe", "Cuenta"];
    const targets = ["tu mejor amigo", "el host", "un objeto", "tu sombra", "el vecino", "tu ex", "tu jefe", "tu mamá", "un extraño", "la pared"];
    const actions = ["algo vergonzoso", "una canción de reggaeton", "tu secreto más oscuro", "un animal salvaje", "un poema de amor", "una receta de cocina"];
    const conditions = ["mientras saltas", "con los ojos cerrados", "en un pie", "con voz de pito", "haciendo la plancha", "sin usar las manos", "llorando", "riendo", "en cámara lenta"];
    
    const text = `${verbs[Math.floor(Math.random()*verbs.length)]} ${actions[Math.floor(Math.random()*actions.length)]} a ${targets[Math.floor(Math.random()*targets.length)]} ${conditions[Math.floor(Math.random()*conditions.length)]}`;
    
    const newChallenge: Partial<Challenge> = {
      text: text,
      category: 'CAOS',
      intensity: this.getMaxIntensity(mode),
      penalty_shots: Math.floor(Math.random() * 5) + 2,
      is_legendary: Math.random() < 0.05
    };

    // Save to Supabase for the record
    try {
      const { data } = await this.supabase.from('challenges').insert(newChallenge).select().single();
      if (data) return data as Challenge;
    } catch (e) {
      console.error('Error saving dynamic challenge', e);
    }

    return { ...newChallenge, id: `dyn-${Date.now()}` } as Challenge;
  }

  getLegendaryChallenge(): Challenge {
    const extreme = this.challenges.filter(c => c.category === 'EXTREMO');
    const challenge = extreme[Math.floor(Math.random() * extreme.length)];
    return {
      ...challenge,
      is_legendary: true,
      penalty_shots: Math.max(5, challenge.penalty_shots + 2)
    };
  }
}
