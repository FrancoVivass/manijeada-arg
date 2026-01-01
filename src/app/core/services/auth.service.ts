import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isInitialized = signal(false);

  constructor(
    public supabase: SupabaseService,
    private router: Router
  ) {
    this.init();
  }

  private async init() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        this.currentUser.set(user);
        // No bloqueamos el init esperando el perfil
        this.ensureUserProfile(user);
      }
    } catch (e) {
      console.error('AuthService: Error during init', e);
    } finally {
      this.isInitialized.set(true);
    }

    this.supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const user = session?.user ?? null;
      this.currentUser.set(user);
      if (user) await this.ensureUserProfile(user);

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (data.user) await this.ensureUserProfile(data.user);
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (data.user) {
      await this.ensureUserProfile(data.user);
      this.currentUser.set(data.user);
    }
    return { data, error };
  }

  public async ensureUserProfile(user: User) {
    try {
      const { data: profile } = await this.supabase.from('users').select('id').eq('id', user.id).maybeSingle();
      if (!profile) {
        const displayName = user.user_metadata['display_name'] || user.email?.split('@')[0] || 'Jugador';
        await this.supabase.from('users').insert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
        });
        await this.supabase.from('stats').upsert({ user_id: user.id }, { onConflict: 'user_id' });
      }
    } catch (e) {
      console.warn('ensureUserProfile: non-critical error', e);
    }
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }


  get isAuthenticated() {
    return !!this.currentUser();
  }

  async updateProfile(updates: { display_name?: string, avatar_url?: string }) {
    const user = this.currentUser();
    if (!user) return;

    const { error } = await this.supabase.from('users').update(updates).eq('id', user.id);
    if (error) throw error;

    // Actualizar metadata de auth si es necesario
    if (updates.display_name) {
      await this.supabase.auth.updateUser({
        data: { display_name: updates.display_name }
      });
    }
  }

  async deleteAccount() {
    const user = this.currentUser();
    if (!user) return;

    // En Supabase real, el borrado de cuenta suele requerir una función RPC o llamar a la API de Admin
    // Para este caso, borramos los datos públicos y cerramos sesión
    const { error } = await this.supabase.from('users').delete().eq('id', user.id);
    if (error) throw error;

    await this.signOut();
  }
}
