import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    if (!environment.supabaseUrl || environment.supabaseUrl === 'YOUR_SUPABASE_URL') {
      console.error('ERROR: Supabase URL no configurada. Edita src/environments/environment.ts');
    }
    this.supabase = createClient(
      environment.supabaseUrl || 'https://placeholder.supabase.co',
      environment.supabaseKey || 'placeholder'
    );
  }

  get client() {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  get rpc() {
    return this.supabase.rpc.bind(this.supabase);
  }

  get from() {
    return this.supabase.from.bind(this.supabase);
  }
}

