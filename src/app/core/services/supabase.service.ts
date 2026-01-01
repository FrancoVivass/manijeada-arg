import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Expose methods directly for easier access
  get auth() { return this.supabase.auth; }
  get from() { return this.supabase.from.bind(this.supabase); }
  get client() { return this.supabase; }
}