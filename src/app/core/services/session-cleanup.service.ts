import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SessionCleanupService {
  private cleanupInterval: any;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hora en ms
  private readonly SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 horas en ms

  constructor(private supabase: SupabaseService) {
    this.startPeriodicCleanup();
  }

  /**
   * Inicia la limpieza periódica cada hora
   */
  private startPeriodicCleanup() {
    // Ejecutar limpieza inicial
    this.performCleanup();

    // Configurar intervalo cada hora
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Ejecuta la limpieza de sesiones expiradas
   */
  private async performCleanup() {
    try {
      console.log('🧹 Ejecutando limpieza automática de sesiones...');

      // Ejecutar función de base de datos
      const { data, error } = await this.supabase.supabase.rpc('cleanup_old_sessions');

      if (error) {
        console.error('❌ Error en limpieza automática:', error);
        return;
      }

      if (data && data.length > 0) {
        const [stats] = data;
        console.log('✅ Limpieza completada:', {
          juegosCerrados: stats.closed_games,
          sesionesLimpias: stats.cleaned_sessions,
          usuariosNotificados: stats.notified_users
        });

        // Opcional: Mostrar notificación al usuario si está en una sesión afectada
        this.notifyAffectedUsers(stats);
      } else {
        console.log('✅ No hay sesiones para limpiar');
      }

    } catch (error) {
      console.error('❌ Error ejecutando limpieza automática:', error);
    }
  }

  /**
   * Notifica a usuarios afectados por la limpieza
   */
  private notifyAffectedUsers(stats: any) {
    // Aquí podrías implementar notificaciones
    // Por ejemplo, mostrar un toast o enviar push notifications
    if (stats.closed_games > 0) {
      console.warn(`⚠️ ${stats.closed_games} juegos cerrados por inactividad`);
    }
  }

  /**
   * Limpieza manual (para debugging o administración)
   */
  async manualCleanup(): Promise<any> {
    console.log('🔧 Ejecutando limpieza manual...');
    const { data, error } = await this.supabase.supabase.rpc('cleanup_old_sessions');

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Obtener estadísticas de sesiones activas
   */
  async getActiveSessions() {
    const { data, error } = await this.supabase.supabase.rpc('get_active_sessions');

    if (error) {
      console.error('Error obteniendo sesiones activas:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Verificar si una sesión específica está expirando pronto
   */
  async checkSessionExpiry(gameId: string): Promise<boolean> {
    try {
      const sessions = await this.getActiveSessions();
      const session = sessions.find((s: any) => s.game_id === gameId);

      if (!session) return false;

      const lastActivity = new Date(session.last_activity);
      const now = new Date();
      const timeDiff = now.getTime() - lastActivity.getTime();

      return timeDiff > (this.SESSION_TIMEOUT - (30 * 60 * 1000)); // Advertir 30 min antes
    } catch (error) {
      console.error('Error verificando expiración de sesión:', error);
      return false;
    }
  }

  /**
   * Detener la limpieza automática (útil para testing)
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Limpieza periódica detenida');
    }
  }

  /**
   * Reiniciar la limpieza automática
   */
  restartPeriodicCleanup() {
    this.stopPeriodicCleanup();
    this.startPeriodicCleanup();
    console.log('🔄 Limpieza periódica reiniciada');
  }
}
