import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionCleanupService } from './session-cleanup.service';

@Injectable({
  providedIn: 'root'
})
export class SessionMonitorService {
  private monitorInterval: any;
  private readonly MONITOR_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private readonly WARNING_TIME = 30 * 60 * 1000; // 30 minutos antes de expirar

  // Señales para UI
  public sessionWarning = signal<string | null>(null);
  public sessionExpired = signal(false);
  public timeRemaining = signal<number | null>(null);

  private currentGameId: string | null = null;

  constructor(
    private sessionCleanup: SessionCleanupService,
    private router: Router
  ) {}

  /**
   * Iniciar monitoreo para un juego específico
   */
  startMonitoring(gameId: string) {
    this.currentGameId = gameId;
    this.stopMonitoring(); // Detener monitoreo anterior si existe

    console.log('👁️ Iniciando monitoreo de sesión para juego:', gameId);

    // Verificación inicial
    this.checkSessionStatus();

    // Monitoreo periódico
    this.monitorInterval = setInterval(() => {
      this.checkSessionStatus();
    }, this.MONITOR_INTERVAL);
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.sessionWarning.set(null);
    this.sessionExpired.set(false);
    this.timeRemaining.set(null);
    this.currentGameId = null;
  }

  /**
   * Verificar estado de la sesión
   */
  private async checkSessionStatus() {
    if (!this.currentGameId) return;

    try {
      const sessions = await this.sessionCleanup.getActiveSessions();
      const session = sessions.find((s: any) => s.game_id === this.currentGameId);

      if (!session) {
        // Sesión ya no existe
        this.handleSessionExpired('La sesión ya no existe');
        return;
      }

      const lastActivity = new Date(session.last_activity);
      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      const timeRemaining = (4 * 60 * 60 * 1000) - timeSinceActivity; // 4 horas

      this.timeRemaining.set(Math.max(0, timeRemaining));

      // Advertir 30 minutos antes
      if (timeRemaining <= this.WARNING_TIME && timeRemaining > 0) {
        const minutesLeft = Math.ceil(timeRemaining / (60 * 1000));
        this.sessionWarning.set(`⚠️ La sesión expirará en ${minutesLeft} minutos por inactividad`);
      }
      // Sesión expirada
      else if (timeRemaining <= 0) {
        this.handleSessionExpired('La sesión ha expirado por inactividad');
      }
      // Todo bien
      else {
        this.sessionWarning.set(null);
      }

    } catch (error) {
      console.error('Error verificando estado de sesión:', error);
    }
  }

  /**
   * Manejar sesión expirada
   */
  private handleSessionExpired(reason: string) {
    console.warn('⏰ Sesión expirada:', reason);

    this.sessionExpired.set(true);
    this.sessionWarning.set(reason);

    // Redirigir al dashboard después de 5 segundos
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.stopMonitoring();
    }, 5000);
  }

  /**
   * Actualizar actividad (llamar cuando el usuario interactúa)
   */
  updateActivity() {
    // Aquí podrías enviar una actualización a la base de datos
    // para resetear el contador de inactividad
    console.log('📱 Actividad detectada, reiniciando contador de sesión');
    this.sessionWarning.set(null);
  }

  /**
   * Obtener tiempo restante formateado
   */
  getFormattedTimeRemaining(): string {
    const remaining = this.timeRemaining();
    if (!remaining || remaining <= 0) return 'Expirada';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
