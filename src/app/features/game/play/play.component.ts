import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { AchievementService } from '../../../core/services/achievement.service';
import { RouletteComponent } from '../../../shared/components/roulette/roulette.component';
import { Game, Player, RouletteOption } from '../../../core/models/game.models';
import { ChallengeService } from '../../../core/services/challenge.service';
import { AuthService } from '../../../core/services/auth.service';
import { DotLottiePlayerComponent } from '../../../shared/components/dot-lottie-player/dot-lottie-player.component';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, RouletteComponent, DotLottiePlayerComponent],
  template: `
    <div class="fade-in play-screen" [class.legendary-mode]="isLegendaryResult()">
      <!-- Game Info Bar -->
      <div class="game-info-bar">
        <div class="current-player-tag">
          <span class="dot"></span>
          Turno de: <strong>{{ currentTurnPlayer().display_name || 'Cargando...' }}</strong>
        </div>
        <div class="game-mode-tag">
          {{ game()?.mode }}
        </div>
        <div class="shots-tag">
          {{ myPlayer()?.shots_count || 0 }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-icon"><path d="M5 2h14l-2 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 2z"/><line x1="12" x2="12" y1="6" y2="18"/></svg>
        </div>
      </div>

      <div class="main-play-area">
        <!-- Roulette Section -->
        <div class="roulette-section" *ngIf="!result()">
          <app-roulette 
            [options]="rouletteOptions" 
            [disabled]="!isMyTurn()"
            (result)="onRouletteResult($event)"
          ></app-roulette>
          
          <div class="turn-hint" *ngIf="!isMyTurn()">
            <p class="text-dim">Esperando que {{ currentTurnPlayer().display_name || 'jugador' }} gire...</p>
          </div>
        </div>

               <!-- Result Overlay (Modern Style) -->
               <div class="result-display fade-in" *ngIf="result()">
                 <div class="result-card modern-card" [class.legendary]="isLegendaryResult()">
                   <div class="lottie-result">
                      <video 
                        *ngIf="result().type === 'DRINK' || result().type === 'GROUP'"
                        autoplay loop muted playsinline 
                        style="width: 120px; height: 120px; object-fit: contain; margin-bottom: 10px;">
                        <source src="assets/animations/Lemonade.webm" type="video/webm">
                      </video>
                      <video 
                        *ngIf="result().type === 'CHALLENGE' || result().type === 'COMBO' || result().type === 'CAOS'"
                        autoplay loop muted playsinline 
                        style="width: 120px; height: 120px; object-fit: contain; margin-bottom: 10px;">
                        <source src="assets/animations/tombstone.webm" type="video/webm">
                      </video>
                    </div>
                    
            <div class="badge" [attr.data-type]="result().type">{{ result().type }}</div>
            
            <!-- Turn Holder View -->
            <div class="turn-view" *ngIf="isMyTurn(); else remoteView">
              <h2 class="result-title">{{ result().title }}</h2>
              <p class="result-text">{{ result().text }}</p>
              
              <div class="shots-penalty" *ngIf="result().penalty">
                Castigo: <strong>{{ result().penalty }} SHOTS</strong>
              </div>
            </div>

            <!-- Others View -->
            <ng-template #remoteView>
              <h2 class="result-title">{{ currentTurnPlayer().display_name || 'Jugador' }}</h2>
              <p class="result-text remote-msg">
                <span [ngSwitch]="result().type">
                  <span *ngSwitchCase="'RULE'">está creando una nueva regla... ⚖️</span>
                  <span *ngSwitchCase="'DRINK'">está tomando un trago... 🥃</span>
                  <span *ngSwitchCase="'CHALLENGE'">está cumpliendo un reto... 🔥</span>
                  <span *ngSwitchCase="'COMBO'">está en un COMBO turbio... ⚡</span>
                  <span *ngSwitchCase="'CAOS'">está en medio del CAOS... 🌀</span>
                  <span *ngSwitchCase="'SAVE'">¡Zafó de esta! 🙌</span>
                  <span *ngSwitchDefault>está resolviendo su turno...</span>
                </span>
              </p>
            </ng-template>

            <!-- Actions (ONLY visible to the player whose turn it is) -->
            <div class="result-actions" *ngIf="isMyTurn()">
              <ng-container [ngSwitch]="result().type">
                <div class="button-group" *ngSwitchCase="'CHALLENGE'">
                  <button (click)="completeChallenge(true)" (touchend)="completeChallenge(true)" class="modern-button success-btn">COMPLETADO</button>
                  <button (click)="completeChallenge(false)" (touchend)="completeChallenge(false)" class="modern-button outline danger-btn">FALLADO</button>
                </div>
                <div class="button-group" *ngSwitchCase="'DRINK'">
                  <button (click)="confirmDrink()" (touchend)="confirmDrink()" class="modern-button">CONTINUAR</button>
                </div>
                <div class="button-group" *ngSwitchCase="'COMBO'">
                  <button (click)="completeChallenge(true)" (touchend)="completeChallenge(true)" class="modern-button success-btn">
                    HECHO
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="btn-icon-small"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button (click)="completeChallenge(false)" (touchend)="completeChallenge(false)" class="modern-button outline danger-btn">
                    FALLÉ
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="btn-icon-small"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="button-group" *ngSwitchDefault>
                  <button (click)="nextTurn()" (touchend)="nextTurn()" class="modern-button">SIGUIENTE</button>
                </div>
              </ng-container>
            </div>

            <!-- Remote Waiting Message (For others) -->
            <div class="remote-waiting" *ngIf="!isMyTurn()">
              <p class="animate-pulse">Esperando que {{ currentTurnPlayer().display_name || 'jugador' }} termine...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Players List (Horizontal Footer) -->
      <footer class="game-footer">
        <div class="players-row">
          <div *ngFor="let p of players()" class="p-mini" [class.active]="p.id === game()?.current_turn_player_id">
            <div class="p-avatar">{{ p.display_name[0] }}</div>
            <div class="p-shots">
              {{ p.shots_count }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mini-icon"><path d="M5 2h14l-2 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 2z"/></svg>
            </div>
          </div>
        </div>
        <button class="quit-game" (click)="quitGame()">X</button>
      </footer>

      <!-- Achievement Toast -->
      <div class="ach-toast modern-card scale-in" *ngIf="newAchievement()">
        <div class="ach-lottie">
          <app-dot-lottie-player
            src="https://lottie.host/1726a40d-d558-45d6-848e-b530f9a56e2e/HInXvY0S0n.lottie"
            [width]="50"
            [height]="50"
            [isLoop]="false">
          </app-dot-lottie-player>
        </div>
        <div class="ach-info">
          <span class="ach-title">¡Logro Desbloqueado!</span>
          <span class="ach-name">{{ newAchievement().name }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .play-screen {
      height: calc(100vh - 180px);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .legendary-mode {
      background: radial-gradient(circle at center, rgba(255,0,0,0.1) 0%, transparent 70%);
    }

    .game-info-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }
    .current-player-tag {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
    }
    .current-player-tag .dot {
      width: 8px;
      height: 8px;
      background: var(--accent-primary);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--accent-primary);
    }
    .game-mode-tag {
      font-size: 0.6rem;
      font-weight: 800;
      background: rgba(255,255,255,0.05);
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      color: var(--accent-primary);
    }
    .shots-tag {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tag-icon { width: 14px; height: 14px; color: var(--accent-primary); }
    .btn-icon-small { width: 16px; height: 16px; margin-left: 8px; }
    .mini-icon { width: 10px; height: 10px; opacity: 0.5; }

    .main-play-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .roulette-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
    }
    .turn-hint { text-align: center; }

    .result-display {
      position: fixed; /* Cambiado de absolute a fixed para asegurar cobertura total en móvil */
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2000; /* Z-index alto para estar sobre el header */
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.9);
      backdrop-filter: blur(10px);
      padding: 20px;
    }
    .result-card {
      width: 100%;
      max-width: 400px;
      text-align: center;
      padding: 40px 24px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 30px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .result-card.legendary { border-color: var(--danger); box-shadow: 0 0 30px rgba(255,0,0,0.2); }
    
    .lottie-result {
      margin-bottom: 10px;
      margin-top: -20px;
    }

    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 1.5px;
      margin-bottom: 20px;
      background: var(--accent-secondary);
      color: black;
      text-transform: uppercase;
    }
    .badge[data-type="CHALLENGE"] { background: var(--accent-primary); }
    .badge[data-type="DRINK"] { background: var(--danger); color: white; }
    .badge[data-type="CAOS"] { background: #facc15; }

    .result-title { font-size: 2rem; font-weight: 900; margin-bottom: 16px; letter-spacing: -1px; }
    .result-text { font-size: 1.1rem; color: rgba(255,255,255,0.8); margin-bottom: 30px; line-height: 1.5; font-weight: 500; }
    .remote-msg { font-style: italic; color: var(--accent-primary); }
    .shots-penalty { margin-bottom: 30px; color: #fff; font-size: 1.2rem; }
    .shots-penalty strong { color: var(--accent-primary); font-size: 1.5rem; }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .modern-button {
      height: 60px; /* Botones más grandes para móvil */
      font-size: 1.1rem;
      font-weight: 950;
      border-radius: 20px;
    }
    .success-btn { background: var(--accent-primary); border-color: var(--accent-primary); color: #000; }
    .danger-btn { color: var(--danger); border-color: var(--danger); }

    .remote-waiting {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .game-footer {
      height: 80px;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 0 10px;
    }
    .players-row {
      flex: 1;
      display: flex;
      overflow-x: auto;
      gap: 16px;
      padding: 10px 0;
    }
    .p-mini {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: 0.3;
      transition: all 0.3s;
    }
    .p-mini.active { opacity: 1; transform: scale(1.1); }
    .p-avatar {
      width: 36px;
      height: 36px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.8rem;
    }
    .p-mini.active .p-avatar { border-color: var(--accent-primary); }
    .p-shots { font-size: 0.65rem; color: var(--text-secondary); }

    .quit-game {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
    }

    .ach-toast {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      z-index: 1000;
      border-color: var(--success);
    }
    .ach-lottie {
      margin-left: -10px;
    }
    .ach-title { font-size: 0.7rem; color: var(--success); text-transform: uppercase; font-weight: 800; }
    .ach-name { font-weight: 700; }

    .scale-in {
      animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes scaleIn {
      from { transform: translateX(-50%) scale(0.8); opacity: 0; }
      to { transform: translateX(-50%) scale(1); opacity: 1; }
    }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-pulse { animation: pulse 2s infinite; }
  `]
})
export class PlayComponent implements OnInit {
  game = signal<Game | null>(null);
  players = signal<Player[]>([]);
  result = signal<any | null>(null);
  isLegendaryResult = signal(false);
  newAchievement = signal<any | null>(null);

  get rouletteOptions(): RouletteOption[] {
    const base: RouletteOption[] = [
      { id: 'drink', label: '¡AL SECO!', color: '#ff4d4d', type: 'DRINK' },
      { id: 'challenge', label: 'RETO MANIJA', color: '#7c3aed', type: 'CHALLENGE' },
      { id: 'combo', label: 'COMBO TURBIO', color: '#f59e0b', type: 'COMBO' },
      { id: 'chaos', label: 'PURO CAOS', color: '#10b981', type: 'CAOS' },
      { id: 'save', label: 'ZAFASTE', color: '#3b82f6', type: 'SAVE' },
      { id: 'rule', label: 'METÉ REGLA', color: '#ec4899', type: 'RULE' },
      { id: 'group', label: 'FONDO BLANCO', color: '#6366f1', type: 'GROUP' },
    ];

    if (this.game()?.settings?.legendary_enabled !== false) {
      base.push({ id: 'legendary', label: 'PRÓCER', color: '#000000', type: 'LEGENDARY' });
    }

    return base;
  }

  constructor(
    private gameService: GameService,
    private challengeService: ChallengeService,
    private achievementService: AchievementService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.loadGame(gameId);
    }
  }

  async loadGame(gameId: string) {
    const { data: game } = await this.gameService.supabase.from('games').select('*').eq('id', gameId).single();
    if (game) {
      this.game.set(game);
      this.gameService.refreshPlayers(gameId);
      this.gameService.getPlayersObservable().subscribe(players => this.players.set(players));

      this.gameService.supabase.client
        .channel(`game_sync:${gameId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sessions',
          filter: `game_id=eq.${gameId}` 
        }, (payload: any) => {
          if (payload.new['action_type'] === 'NEXT_TURN') {
            // Si soy el HOST, yo proceso el cambio de turno real en la DB
            if (this.isHost()) {
              this.nextTurn(true); // El true indica que es el proceso real
            }
          } else {
            this.handleRemoteAction(payload.new);
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        }, (payload: any) => {
          const updatedGame = payload.new as Game;
          this.game.set(updatedGame);
          this.result.set(null);
          this.isLegendaryResult.set(false);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        }, () => {
          this.gameService.refreshPlayers(gameId);
        })
        .subscribe();
    }
  }

  myPlayer() {
    return this.players().find(p => p.user_id === this.authService.currentUser()?.id);
  }

  currentTurnPlayer() {
    const turnId = this.game()?.current_turn_player_id;
    return this.players().find(p => p.id === turnId) || this.players()[0];
  }

  isMyTurn() {
    const user = this.authService.currentUser();
    const current = this.currentTurnPlayer();
    if (!current) return false;
    
    // Un jugador tiene el turno si su user_id coincide con el del usuario actual
    return current.user_id === user?.id;
  }

  async onRouletteResult(option: RouletteOption) {
    if (!this.isMyTurn()) return;

    let res: any;
    const game = this.game()!;
    const mode = game.mode;
    const settings = game.settings;
    const categories = settings?.categories || ['SOCIAL', 'ALCOHOL', 'CAOS'];
    
    this.isLegendaryResult.set(option.id === 'legendary');

    switch(option.id) {
      case 'drink':
        const d = this.challengeService.getRandomDrink();
        res = { title: '¡A TOMAR!', text: d.text, type: 'DRINK', shots: d.shots };
        break;
      case 'challenge':
        const c = this.challengeService.getRandomChallenge(mode, categories);
        res = { title: 'RETO', text: c.text, type: 'CHALLENGE', penalty: c.penalty_shots };
        break;
      case 'combo':
        // Filter categories for combo (usually alcohol + something else)
        const comboCats = categories.filter(cat => ['ALCOHOL', 'CAOS', 'SOCIAL'].includes(cat));
        const co = this.challengeService.getRandomChallenge(mode, comboCats.length > 0 ? comboCats : categories);
        res = { title: 'COMBO', text: co.text + ' ...Y toma 1 shot extra!', type: 'COMBO', penalty: co.penalty_shots + 1, shots: 1 };
        break;
      case 'chaos':
        const dyn = await this.challengeService.generateDynamicChallenge(mode);
        res = { title: 'CAOS', text: dyn.text, type: 'CAOS', penalty: dyn.penalty_shots };
        break;
      case 'legendary':
        if (settings?.legendary_enabled === false) {
          // If legendary is disabled but somehow they hit it, give a normal challenge
          const fallback = this.challengeService.getRandomChallenge(mode, categories);
          res = { title: 'RETO', text: fallback.text, type: 'CHALLENGE', penalty: fallback.penalty_shots };
        } else {
          const leg = this.challengeService.getLegendaryChallenge();
          res = { title: 'LEGENDARIO', text: leg.text, type: 'CHALLENGE', penalty: 5, legendary: true };
        }
        break;
      case 'save':
        res = { title: 'SALVADO', text: 'Te has librado por esta vez.', type: 'SAVE' };
        break;
      case 'rule':
        res = { title: 'NUEVA REGLA', text: 'Crea una regla para el grupo. El que la rompa toma.', type: 'RULE' };
        break;
      case 'group':
        res = { title: 'TODOS TOMAN', text: 'Todos los jugadores toman 1 shot.', type: 'GROUP', shots: 1 };
        break;
      default:
        res = { title: 'INFO', text: 'Algo pasó...', type: 'INFO' };
    }

    this.result.set(res);
    this.syncActionToSupabase(res);
  }

  async syncActionToSupabase(res: any) {
    const player = this.myPlayer() || this.currentTurnPlayer();
    if (!player) return;

    await this.gameService.supabase.from('sessions').insert({
      game_id: this.game()!.id,
      player_id: player.id,
      action_type: res.type,
      action_description: JSON.stringify(res),
      was_completed: null
    });
  }

  handleRemoteAction(session: any) {
    if (!this.isMyTurn()) {
      try {
        const res = JSON.parse(session.action_description);
        res.remote = true;
        this.result.set(res);
        this.isLegendaryResult.set(res.legendary || res.type === 'CAOS');
      } catch (e) {
        console.error('Error parsing remote action', e);
      }
    }
  }

  async completeChallenge(completed: boolean) {
    const res = this.result();
    const activePlayer = this.currentTurnPlayer();
    if (!activePlayer) return;

    if (completed) {
      // Si el que clickea es el dueño del turno, chequear logros
      if (this.isMyTurn()) {
        const ach = await this.achievementService.checkAndUnlock('first_challenge');
        if (ach) this.showAchievement(ach);
      }
    } else {
      // Aplicar castigo al jugador que tiene el turno actual
      await this.applyShots(activePlayer, res.penalty || 1);
    }
    this.nextTurn();
  }

  async confirmDrink() {
    const res = this.result();
    const activePlayer = this.currentTurnPlayer();
    if (!activePlayer) return;
    await this.applyShots(activePlayer, res.shots || 1);
    this.nextTurn();
  }

  async applyShots(player: Player, count: number) {
    const newCount = (player.shots_count || 0) + count;
    await this.gameService.supabase.from('players').update({ shots_count: newCount }).eq('id', player.id);
    if (newCount >= 1) {
      const ach = await this.achievementService.checkAndUnlock('first_shot');
      if (ach) this.showAchievement(ach);
    }
  }

  showAchievement(ach: any) {
    this.newAchievement.set(ach);
    setTimeout(() => this.newAchievement.set(null), 4000);
  }

  isHost() {
    return this.game()?.host_id === this.authService.currentUser()?.id;
  }

  async nextTurn(isConfirmed = false) {
    if (isConfirmed && this.isHost()) {
      // PROCESO REAL DE CAMBIO DE TURNO (Solo Host)
      const currentIdx = this.players().findIndex(p => p.id === this.game()?.current_turn_player_id);
      const nextIdx = (currentIdx + 1) % this.players().length;
      const nextPlayer = this.players()[nextIdx];
      await this.gameService.supabase.from('games').update({ current_turn_player_id: nextPlayer.id }).eq('id', this.game()!.id);
    } else {
      // PETICIÓN DE CAMBIO DE TURNO (Cualquiera)
      await this.gameService.supabase.from('sessions').insert({
        game_id: this.game()!.id,
        player_id: this.myPlayer()?.id || this.currentTurnPlayer()?.id,
        action_type: 'NEXT_TURN',
        action_description: JSON.stringify({ type: 'NEXT_TURN', requester: this.myPlayer()?.display_name }),
        was_completed: true
      });
    }
  }

  quitGame() {
    if (confirm('¿Cerrar partida?')) this.router.navigate(['/dashboard']);
  }
}
