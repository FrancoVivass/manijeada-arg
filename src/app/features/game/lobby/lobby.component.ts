import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { Player, Game } from '../../../core/models/game.models';
import { QrCodeComponent } from '../../../shared/components/qr-code/qr-code.component';
import { AuthService } from '../../../core/services/auth.service';
import { SessionMonitorService } from '../../../core/services/session-monitor.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, QrCodeComponent],
  template: `
    <div class="fade-in">
      <!-- Session Warning -->
      <div class="session-warning" *ngIf="sessionMonitor.sessionWarning()">
        <div class="warning-card modern-card">
          <div class="warning-icon">⏰</div>
          <div class="warning-content">
            <h3>¡Atención!</h3>
            <p>{{ sessionMonitor.sessionWarning() }}</p>
            <p class="time-remaining" *ngIf="sessionMonitor.timeRemaining() && sessionMonitor.timeRemaining()! > 0">
              Tiempo restante: {{ sessionMonitor.getFormattedTimeRemaining() }}
            </p>
          </div>
          <button class="warning-close" (click)="sessionMonitor.sessionWarning.set(null)">×</button>
        </div>
      </div>

      <section class="modern-card lobby-header">
        <div class="header-info">
          <h1>SALA DE ESPERA</h1>
          <div class="code-pill">
            <span class="text-dim">CÓDIGO:</span>
            <span class="code-value">{{ game()?.join_code }}</span>
          </div>
        </div>
        <p class="text-dim mode-text">MODO: {{ game()?.mode }}</p>
        <div class="settings-preview">
          <span class="setting-item" *ngIf="game()?.settings?.legendary_enabled">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="setting-icon-svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Legendarios
          </span>
          <span class="setting-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="setting-icon-svg"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6Z"/><path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Z"/></svg>
            Nivel {{ game()?.settings?.chaos_level }}
          </span>
        </div>
        <div class="categories-preview">
          <span *ngFor="let cat of game()?.settings?.categories" class="cat-tag">{{ cat }}</span>
        </div>
      </section>

      <div class="lobby-grid">
        <!-- QR Section (Siempre visible para el host) -->
        <div class="modern-card qr-card" *ngIf="isHost()">
          <app-qr-code [value]="joinUrl"></app-qr-code>
          <div class="qr-info">
            <p>Escanea para unirte</p>
            <span class="text-dim">Comparte el código con tus amigos</span>
          </div>
        </div>


        <!-- Players Section -->
        <div class="modern-card players-card">
          <div class="section-header">
            <h3>Jugadores</h3>
            <span class="player-count">{{ players().length }}</span>
          </div>
          
          <div class="players-list">
            <div *ngFor="let player of players()" class="player-item">
              <div class="player-avatar">{{ player.display_name[0] }}</div>
              <div class="player-info">
                <span class="player-name">{{ player.display_name }}</span>
                <span class="player-role" *ngIf="player.user_id === game()?.host_id">HOST</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Action Footer -->
      <div class="lobby-actions" *ngIf="isHost()">
        <button (click)="startGame()" class="modern-button" [disabled]="players().length < 1">
          INICIAR CAOS
        </button>
      </div>
      
      <div class="lobby-actions" *ngIf="!isHost()">
        <p class="waiting-text animate-pulse">Esperando que el host inicie...</p>
      </div>
    </div>
  `,
  styles: [`
    .lobby-header { text-align: center; }
    .header-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .code-pill {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      padding: 8px 20px;
      border-radius: 30px;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .code-value { font-weight: 800; letter-spacing: 2px; font-size: 1.2rem; }
    .mode-text { text-transform: uppercase; font-weight: 600; font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 10px; }

    .settings-preview {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    .setting-item {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent-secondary);
      background: rgba(255,255,255,0.03);
      padding: 4px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .setting-icon-svg { width: 12px; height: 12px; }
    .categories-preview {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
    }
    .cat-tag {
      font-size: 0.55rem;
      font-weight: 800;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 2px 8px;
      border-radius: 4px;
      color: var(--text-secondary);
    }

    .lobby-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .qr-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .qr-info { text-align: center; }
    .qr-info p { font-weight: 600; margin-bottom: 4px; }

    .players-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .player-count {
      background: var(--accent-primary);
      color: black;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .players-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }
    .player-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.02);
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .player-avatar {
      width: 32px;
      height: 32px;
      background: var(--bg-primary);
      border: 1px solid var(--accent-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
    }
    .player-info { display: flex; align-items: center; gap: 8px; flex: 1; }
    .player-name { font-size: 0.9rem; font-weight: 500; }
    .player-role {
      font-size: 0.6rem;
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent-secondary);
    }
    .guest-form {
      margin-top: 10px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .lobby-actions {
      margin-top: 20px;
      text-align: center;
    }
    .waiting-text {
      color: var(--text-secondary);
      font-style: italic;
      font-size: 0.9rem;
    }

    /* Session Warnings */
    .session-warning {
      margin-bottom: 20px;
      animation: warningPulse 2s infinite;
    }

    .warning-card {
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      color: white;
      border: none;
      position: relative;
    }

    .warning-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .warning-content h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
    }

    .warning-content p {
      margin: 0 0 8px 0;
      font-size: 0.95rem;
    }

    .time-remaining {
      font-weight: bold;
      color: #ffeaa7;
    }

    .warning-close {
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .warning-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @keyframes warningPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    @media (min-width: 600px) {
      .lobby-grid { grid-template-columns: 1fr 1.5fr; }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    .animate-pulse { animation: pulse 2s infinite ease-in-out; }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  game = signal<Game | null>(null);
  players = signal<Player[]>([]);
  joinUrl = '';

  constructor(
    private gameService: GameService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public sessionMonitor: SessionMonitorService
  ) {}

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.loadGame(gameId);
      this.sessionMonitor.startMonitoring(gameId);
    }
  }

  ngOnDestroy() {
    this.sessionMonitor.stopMonitoring();
  }

  /**
   * Actualizar actividad de la sesión
   */
  private updateSessionActivity() {
    this.sessionMonitor.updateActivity();
  }

  async loadGame(gameId: string) {
    const { data: game } = await this.gameService.supabase.from('games').select('*').eq('id', gameId).single();
    if (game) {
      this.game.set(game);
      this.joinUrl = `${window.location.origin}/game/join/${game.join_code}`;
      this.gameService.refreshPlayers(gameId);
      
      this.gameService.getPlayersObservable().subscribe(players => {
        this.players.set(players);
      });

      this.gameService.supabase.client
        .channel(`game_status:${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        }, (payload: any) => {
          console.log('🎯 Realtime update received:', {
            gameId,
            oldStatus: this.game()?.status,
            newStatus: payload.new?.status,
            gameType: payload.new?.game_type,
            isHost: this.isHost(),
            userId: this.authService.currentUser()?.id
          });

          // Update the game signal with the new data
          this.game.set(payload.new as Game);

          // Only auto-navigate if status changed to IN_PROGRESS and we're not the host
          // (hosts handle navigation manually in startGame())
          if (payload.new['status'] === 'IN_PROGRESS' && !this.isHost()) {
            const gameType = payload.new['game_type'] || 'ROULETTE';
            console.log('🎮 Auto-navigating to game:', { gameType, gameId });

            if (gameType === 'IMPOSTOR') {
              this.router.navigate([`/game/impostor/play`, gameId]);
            } else if (gameType === 'CARDS') {
              this.router.navigate([`/game/play/cards`, gameId]);
            } else if (gameType === 'MIMIC') {
              this.router.navigate([`/game/mimic/play`, gameId]);
            } else {
              this.router.navigate([`/game/play/roulette`, gameId]);
            }
          }
        })
        .subscribe((status) => {
          console.log('📡 Realtime subscription status:', status);
        });
    }
  }

  isHost() {
    const game = this.game();
    if (!game) return false;

    return game.host_id === this.authService.currentUser()?.id;
  }

  async startGame() {
    if (this.game()) {
      console.log('🎮 Before startGame - game object:', this.game());
      console.log('🎮 Before startGame - game_type:', this.game()!.game_type);

      await this.gameService.startGame(this.game()!.id);
      this.updateSessionActivity(); // Actualizar actividad

      // Wait for the real-time update to propagate
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('🎮 After startGame - game object:', this.game());
      console.log('🎮 After startGame - game_type:', this.game()!.game_type);

      const gameType = this.game()!.game_type || 'ROULETTE';
      console.log('🎮 Final game type used for routing:', gameType);

      // Navigate based on game type
      if (gameType === 'IMPOSTOR') {
        console.log('🕵️‍♂️ Host navigating to Impostor');
        this.router.navigate([`/game/impostor/play`, this.game()!.id]);
      } else if (gameType === 'CARDS') {
        console.log('🃏 Host navigating to Cards');
        this.router.navigate([`/game/play/cards`, this.game()!.id]);
      } else if (gameType === 'MIMIC') {
        console.log('🎭 Host navigating to Mimic');
        this.router.navigate([`/game/mimic/play`, this.game()!.id]);
      } else {
        console.log('🎡 Host navigating to Roulette');
        this.router.navigate([`/game/play/roulette`, this.game()!.id]);
      }
    }
  }

}
