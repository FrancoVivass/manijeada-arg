import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../../core/services/game.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Game, Player } from '../../../../core/models/game.models';
import { MIMIC_CATEGORIES, MIMIC_ALL_WORDS } from '../../../../core/data/mimic-words';

interface MimicGameState {
  currentWord: string;
  currentActor: string;
  currentRound: number;
  timeLeft: number;
  gamePhase: 'WAITING' | 'ACTING' | 'GUESSING' | 'ROUND_END' | 'GAME_END';
  scores: { [playerId: string]: number };
  guessedWords: string[];
  usedWords: string[];
}

@Component({
  selector: 'app-mimic-play',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mimic-play-container fade-in" [class.game-active]="gameState().gamePhase === 'ACTING'">

      <!-- Game Header -->
      <div class="game-header">
        <div class="round-info">
          <span class="round-badge">RONDA {{ gameState().currentRound }}</span>
          <span class="phase-badge" [class]="gameState().gamePhase.toLowerCase()">
            {{ getPhaseText() }}
          </span>
        </div>

        <div class="timer-display" *ngIf="gameState().gamePhase === 'ACTING'">
          <div class="timer-circle" [style.--progress]="getTimerProgress()">
            <span class="timer-text">{{ gameState().timeLeft }}</span>
          </div>
        </div>

        <div class="players-count">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="players-icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {{ players().length }}
        </div>
      </div>

      <!-- Main Game Area -->
      <div class="main-game-area">

        <!-- Waiting Phase -->
        <div class="phase-content waiting" *ngIf="gameState().gamePhase === 'WAITING'">
          <div class="waiting-card modern-card">
            <h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M9 15c2 1 4 1 6 0"/></svg> Preparándose para Mímica</h2>
            <p class="waiting-text">Todos los jugadores están listos. ¡La diversión está por comenzar!</p>
            <div class="waiting-players">
              <div class="player-ready" *ngFor="let player of players()">
                <span class="ready-dot"></span>
                <span>{{ player.display_name }}</span>
              </div>
            </div>
            <button class="modern-button primary" *ngIf="isHost()" (click)="startGame()">
              ¡COMENZAR JUEGO!
            </button>
          </div>
        </div>

        <!-- Acting Phase -->
        <div class="phase-content acting" *ngIf="gameState().gamePhase === 'ACTING'">
          <div class="acting-card modern-card">
            <div class="actor-info">
              <div class="actor-avatar">
                {{ getCurrentActor()?.display_name?.[0] || '?' }}
              </div>
              <div class="actor-details">
                <h3>{{ getCurrentActor()?.display_name || 'Jugador' }}</h3>
                <p class="actor-role">ACTUANDO</p>
              </div>
            </div>

            <div class="word-display">
              <div class="word-hidden" *ngIf="!isCurrentActor()">
                <span class="mystery-text">🤐 ¿Qué estará actuando?</span>
                <p class="hint-text">Solo el actor puede ver la palabra</p>
              </div>
              <div class="word-reveal" *ngIf="isCurrentActor()">
                <div class="word-card">
                  <span class="word-text">{{ gameState().currentWord }}</span>
                  <div class="word-category">
                    {{ getWordCategory() }}
                  </div>
                </div>
                <p class="actor-instructions">
                  ¡Actúa sin hablar! Usa gestos, movimientos y expresiones faciales.
                </p>
              </div>
            </div>

            <div class="action-buttons" *ngIf="isCurrentActor() && gameState().gamePhase === 'ACTING'">
              <button class="end-turn-button modern-button primary" (click)="someoneGuessed()">
                ¡ALGUIEN ACERTÓ!
              </button>
              <button class="timeout-button modern-button outline" (click)="endActingPhase()">
                SE ACABÓ EL TIEMPO
              </button>
            </div>

            <div class="action-buttons" *ngIf="!isCurrentActor() && gameState().gamePhase === 'ACTING'">
              <button class="guess-button modern-button outline" (click)="wantToGuess()">
                ¡QUIERO ADIVINAR!
              </button>
            </div>
          </div>
        </div>


        <!-- Round End Phase -->
        <div class="phase-content round-end" *ngIf="gameState().gamePhase === 'ROUND_END'">
          <div class="round-end-card modern-card">
            <h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M10 14l11 4"/><path d="m9 12-1.5 6.5"/><path d="M14 8l4.5-1"/></svg> ¡Ronda Terminada!</h2>
            <div class="round-results">
              <div class="result-word">
                <span class="result-label">Palabra:</span>
                <span class="result-value">{{ gameState().currentWord }}</span>
              </div>
              <div class="result-actor">
                <span class="result-label">Actor:</span>
                <span class="result-value">{{ getCurrentActor()?.display_name }}</span>
              </div>
              <div class="result-guesses">
                <span class="result-label">Resultado:</span>
                <span class="result-value">{{ gameState().guessedWords[0] || 'Nadie acertó' }}</span>
              </div>
            </div>

            <div class="round-scores">
              <h3>Puntuaciones de la ronda:</h3>
              <div class="score-list">
                <div class="score-item" *ngFor="let player of getPlayersByScore()">
                  <span class="player-name">{{ player.display_name }}</span>
                  <span class="player-score">+{{ getRoundScore(player.id) }}</span>
                </div>
              </div>
            </div>

            <button class="modern-button primary" *ngIf="isHost()" (click)="nextRound()">
              SIGUIENTE RONDA
            </button>
          </div>
        </div>

        <!-- Game End Phase -->
        <div class="phase-content game-end" *ngIf="gameState().gamePhase === 'GAME_END'">
          <div class="game-end-card modern-card">
            <h2>🎊 ¡JUEGO TERMINADO!</h2>
            <div class="final-results">
              <div class="winner-crown">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="crown-icon"><path d="M5 4h14l-1 6h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3l-1 6H5l-1-6H1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2l-1-6z"/><path d="m9 12 2-2 2 2"/></svg>
              </div>
              <div class="winner-info">
                <h3>{{ getWinner()?.display_name || 'Ganador' }}</h3>
                <p class="winner-score">{{ getWinnerScore() }} puntos</p>
              </div>
            </div>

            <div class="final-scores">
              <h3>Clasificación Final:</h3>
              <div class="final-score-list">
                <div class="final-score-item" *ngFor="let player of getPlayersByFinalScore(); let i = index">
                  <div class="rank">{{ i + 1 }}</div>
                  <span class="player-name">{{ player.display_name }}</span>
                  <span class="player-score">{{ gameState().scores[player.id] || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="end-actions">
              <button class="modern-button outline" (click)="playAgain()">
                JUGAR DE NUEVO
              </button>
              <button class="modern-button primary" (click)="goToDashboard()">
                VOLVER AL INICIO
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Players Sidebar -->
      <div class="players-sidebar">
        <h3>Jugadores</h3>
        <div class="players-list">
          <div class="player-item"
               *ngFor="let player of players()"
               [class.current-actor]="player.id === gameState().currentActor"
               [class.current-user]="player.id === myPlayer()?.id">
            <div class="player-avatar">
              {{ player.display_name[0] }}
            </div>
            <div class="player-info">
              <span class="player-name">{{ player.display_name }}</span>
              <span class="player-score">{{ gameState().scores[player.id] || 0 }} pts</span>
            </div>
            <div class="player-status" *ngIf="player.id === gameState().currentActor">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="status-icon"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M9 15c2 1 4 1 6 0"/></svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .mimic-play-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      display: grid;
      grid-template-columns: 1fr 300px;
      grid-template-rows: auto 1fr;
      gap: 20px;
      padding: 20px;
    }

    .game-header {
      grid-column: 1 / -1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }

    .round-info { display: flex; gap: 15px; }
    .round-badge, .phase-badge {
      background: var(--accent-primary);
      color: #000;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 0.9rem;
    }
    .phase-badge.waiting { background: var(--text-secondary); color: #fff; }
    .phase-badge.acting { background: #ff6b35; }
    .phase-badge.guessing { background: #4ecdc4; }
    .phase-badge.round_end { background: #45b7d1; }
    .phase-badge.game_end { background: #f9ca24; }

    .timer-display { display: flex; justify-content: center; }
    .timer-circle {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: conic-gradient(var(--accent-primary) calc(var(--progress) * 360deg), rgba(255,255,255,0.1) 0deg);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .timer-circle::before {
      content: '';
      position: absolute;
      width: 65px; height: 65px;
      background: #0a0a0a;
      border-radius: 50%;
    }
    .timer-text {
      position: relative; z-index: 1;
      font-size: 1.5rem; font-weight: bold;
      color: #fff;
    }

    .players-count {
      display: flex; align-items: center; gap: 8px;
      color: var(--text-secondary);
    }
    .players-icon { width: 20px; height: 20px; }

    /* Icon styles */
    .inline-icon { width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px; }
    .crown-icon { width: 60px; height: 60px; display: block; margin: 0 auto 15px; }
    .status-icon { width: 16px; height: 16px; }

    .main-game-area {
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }

    .phase-content { width: 100%; max-width: 600px; }

    .modern-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
    }

    /* Waiting Phase */
    .waiting h2 { font-size: 2rem; margin-bottom: 15px; }
    .waiting-text { color: var(--text-secondary); margin-bottom: 25px; }
    .waiting-players { margin-bottom: 30px; }
    .player-ready {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px; justify-content: center;
    }
    .ready-dot {
      width: 12px; height: 12px;
      background: var(--success); border-radius: 50%;
    }

    /* Acting Phase */
    .actor-info {
      display: flex; align-items: center; gap: 20px;
      margin-bottom: 30px; justify-content: center;
    }
    .actor-avatar {
      width: 60px; height: 60px;
      background: var(--accent-primary);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: bold;
      color: #000;
    }
    .actor-details h3 { margin: 0; font-size: 1.5rem; }
    .actor-role {
      color: var(--accent-primary); font-weight: 600;
      margin: 5px 0 0 0;
    }

    .word-display { margin-bottom: 30px; }
    .word-hidden { padding: 40px; }
    .mystery-text { font-size: 1.5rem; display: block; margin-bottom: 10px; }
    .hint-text { color: var(--text-secondary); }

    .word-reveal { padding: 40px; }
    .word-card {
      background: rgba(255,255,255,0.1);
      border: 2px solid var(--accent-primary);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
    }
    .word-text {
      font-size: 3rem; font-weight: 900;
      color: var(--accent-primary);
      text-transform: uppercase;
      letter-spacing: 2px;
      display: block;
    }
    .word-category {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 10px;
    }
    .actor-instructions {
      color: var(--text-secondary);
      font-style: italic;
    }

    .action-buttons { margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
    .guess-button { font-size: 1.2rem; padding: 15px 30px; }
    .end-turn-button { font-size: 1.1rem; padding: 12px 24px; }
    .timeout-button { font-size: 1.1rem; padding: 12px 24px; }

    /* Guessing Phase */
    .guessing h2 { margin-bottom: 25px; }
    .guess-input-area {
      display: flex; gap: 15px; margin-bottom: 15px;
      align-items: center;
    }
    .guess-input-area input {
      flex: 1;
      text-align: center;
      font-size: 1.2rem;
      padding: 15px;
    }
    .guess-hint { color: var(--text-secondary); font-size: 0.9rem; }

    /* Round End Phase */
    .round-end h2 { margin-bottom: 25px; }
    .round-results { margin-bottom: 30px; }
    .result-word, .result-actor, .result-guesses {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .result-label { color: var(--text-secondary); }
    .result-value { font-weight: bold; }

    .round-scores h3 { margin-bottom: 20px; }
    .score-list { margin-bottom: 30px; }
    .score-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    /* Game End Phase */
    .game-end h2 { margin-bottom: 25px; }
    .final-results { margin-bottom: 30px; }
    .winner-crown { font-size: 4rem; margin-bottom: 15px; }
    .winner-info h3 { font-size: 2rem; margin-bottom: 5px; }
    .winner-score { color: var(--accent-primary); font-size: 1.2rem; }

    .final-scores h3 { margin-bottom: 20px; }
    .final-score-list { margin-bottom: 30px; }
    .final-score-item {
      display: flex; align-items: center; gap: 15px;
      padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .rank {
      width: 30px; height: 30px;
      background: var(--accent-primary);
      color: #000; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold;
    }

    .end-actions { display: flex; gap: 15px; justify-content: center; }

    /* Players Sidebar */
    .players-sidebar {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }
    .players-sidebar h3 {
      margin-bottom: 20px; color: var(--accent-primary);
      font-size: 1.1rem; text-transform: uppercase;
    }

    .players-list { display: flex; flex-direction: column; gap: 10px; }
    .player-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 8px;
      background: rgba(255,255,255,0.02);
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .player-item.current-actor {
      border-color: var(--accent-primary);
      background: rgba(255,255,255,0.08);
    }
    .player-item.current-user {
      border-color: var(--accent-secondary);
    }

    .player-avatar {
      width: 35px; height: 35px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold;
    }
    .player-info { flex: 1; }
    .player-name { display: block; font-size: 0.9rem; }
    .player-score { font-size: 0.8rem; color: var(--text-secondary); }

    .player-status { font-size: 1.2rem; }


    /* Modern Button Styles */
    .modern-button {
      background: var(--accent-primary); color: #000; font-weight: 800;
      padding: 12px 24px; border-radius: 25px; border: none;
      cursor: pointer; transition: all 0.3s; font-size: 0.9rem;
    }
    .modern-button:hover { transform: translateY(-2px); }
    .modern-button.outline {
      background: transparent; color: #fff; border: 1px solid var(--border-color);
    }
    .modern-button.outline:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
    .modern-button.primary { background: var(--accent-primary); color: #000; }

    .modern-input {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px 16px;
      color: #fff;
      font-size: 1rem;
    }
    .modern-input:focus { outline: none; border-color: var(--accent-primary); }

    @media (max-width: 1024px) {
      .mimic-play-container { grid-template-columns: 1fr; grid-template-rows: auto auto 1fr; }
      .players-sidebar { order: 2; }
      .main-game-area { order: 3; }
    }

    @media (max-width: 768px) {
      .mimic-play-container { padding: 10px; }
      .game-header { flex-direction: column; gap: 15px; text-align: center; }
      .round-info { justify-content: center; }
      .main-game-area { padding: 10px; }
      .modern-card { padding: 20px; }
      .word-text { font-size: 2rem; }
      .actor-info { flex-direction: column; gap: 15px; }
      .guess-input-area { flex-direction: column; }
      .end-actions { flex-direction: column; }
      .modal-actions { flex-direction: column; }
    }
  `]
})
export class MimicPlayComponent implements OnInit, OnDestroy {
  game = signal<Game | null>(null);
  players = signal<Player[]>([]);
  gameState = signal<MimicGameState>({
    currentWord: '',
    currentActor: '',
    currentRound: 1,
    timeLeft: 60,
    gamePhase: 'WAITING',
    scores: {},
    guessedWords: [],
    usedWords: []
  });

  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.loadGame(gameId);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  async loadGame(gameId: string) {
    const { data: game } = await this.gameService.supabase.from('games').select('*').eq('id', gameId).single();
    if (game) {
      this.game.set(game);
      this.gameService.refreshPlayers(gameId);

      this.gameService.getPlayersObservable().subscribe(players => {
        this.players.set(players);

        // Initialize scores for all players
        const scores: { [playerId: string]: number } = {};
        players.forEach(player => {
          scores[player.id] = 0;
        });
        this.gameState.update(state => ({ ...state, scores }));
      });

      // Load game state from database
      this.loadGameState(game);
    }
  }

  loadGameState(game: Game) {
    const mimicSettings = game.settings as any;
    if (mimicSettings.gameState) {
      this.gameState.set(mimicSettings.gameState);
      if (this.gameState().gamePhase === 'ACTING') {
        this.startTimer();
      }
    }
  }

  isHost(): boolean {
    const game = this.game();
    if (!game) return false;
    return game.host_id === this.authService.currentUser()?.id;
  }

  myPlayer(): Player | null {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return null;
    return this.players().find(p => p.user_id === currentUser.id) || null;
  }

  getCurrentActor(): Player | null {
    return this.players().find(p => p.id === this.gameState().currentActor) || null;
  }

  isCurrentActor(): boolean {
    return this.myPlayer()?.id === this.gameState().currentActor;
  }

  getPhaseText(): string {
    switch (this.gameState().gamePhase) {
      case 'WAITING': return 'ESPERANDO';
      case 'ACTING': return 'ACTUANDO';
      case 'GUESSING': return 'ADIVINANDO';
      case 'ROUND_END': return 'RONDA TERMINADA';
      case 'GAME_END': return 'JUEGO TERMINADO';
      default: return 'CARGANDO';
    }
  }

  getTimerProgress(): number {
    const settings = this.game()?.settings as any;
    const totalTime = settings?.mimicSettings?.timeLimit || 60;
    return (this.gameState().timeLeft / totalTime);
  }

  getWordCategory(): string {
    const word = this.gameState().currentWord;
    for (const category of MIMIC_CATEGORIES) {
      if (category.words.includes(word)) {
        return `${category.icon} ${category.name}`;
      }
    }
    return 'MÍMICA';
  }

  async startGame() {
    if (!this.isHost()) return;

    const settings = this.game()?.settings as any;
    const mimicSettings = settings?.mimicSettings;

    // Select first actor and word
    const players = this.players();
    const firstActor = players[Math.floor(Math.random() * players.length)];
    const availableWords = this.getAvailableWords(mimicSettings);
    const firstWord = availableWords[Math.floor(Math.random() * availableWords.length)];

    const newState: MimicGameState = {
      ...this.gameState(),
      currentWord: firstWord,
      currentActor: firstActor.id,
      currentRound: 1,
      timeLeft: mimicSettings?.timeLimit || 60,
      gamePhase: 'ACTING',
      guessedWords: [],
      usedWords: [firstWord]
    };

    this.gameState.set(newState);
    this.startTimer();
    await this.saveGameState(newState);
  }

  getAvailableWords(mimicSettings: any): string[] {
    const selectedCategories = mimicSettings?.categories || [];
    let availableWords: string[] = [];

    if (selectedCategories.length === 0) {
      // If no categories selected, use all words
      availableWords = MIMIC_ALL_WORDS;
    } else {
      // Filter by selected categories
      for (const categoryId of selectedCategories) {
        const category = MIMIC_CATEGORIES.find(c => c.id === categoryId);
        if (category) {
          availableWords.push(...category.words);
        }
      }
    }

    // Remove used words
    return availableWords.filter(word => !this.gameState().usedWords.includes(word));
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.gameState.update(state => {
        const newTimeLeft = state.timeLeft - 1;
        if (newTimeLeft <= 0) {
          this.endActingPhase();
          return { ...state, timeLeft: 0 };
        }
        return { ...state, timeLeft: newTimeLeft };
      });
    }, 1000);
  }

  async endActingPhase() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Si se acabó el tiempo sin que nadie acertara, no hay puntos
    if (this.gameState().guessedWords.length === 0) {
      this.gameState.update(state => ({
        ...state,
        guessedWords: ['Nadie acertó...']
      }));
    }

    this.gameState.update(state => ({ ...state, gamePhase: 'ROUND_END' }));
    await this.saveGameState(this.gameState());
  }

  wantToGuess() {
    // Solo indica que alguien quiere adivinar (presencial)
    // El actor decidirá si acertaron o no
    console.log(`${this.myPlayer()?.display_name} quiere adivinar la palabra: ${this.gameState().currentWord}`);
    alert('¡Le dijiste al actor que quieres adivinar! Ahora díselo en voz alta.');
  }

  async someoneGuessed() {
    // El actor indica que alguien acertó
    const player = this.myPlayer();
    if (player && this.isCurrentActor()) {
      const currentScores = this.gameState().scores;
      const newScores = {
        ...currentScores,
        [player.id]: (currentScores[player.id] || 0) + 10
      };

      this.gameState.update(state => ({
        ...state,
        scores: newScores,
        guessedWords: [...state.guessedWords, 'Alguien acertó!']
      }));

      await this.endActingPhase();
    }
  }

  getRoundScore(playerId: string): number {
    // En mímica, solo el actor recibe puntos si alguien acertó
    if (playerId === this.gameState().currentActor && this.gameState().guessedWords.some(word => word === 'Alguien acertó!')) {
      return 10;
    }
    return 0;
  }

  getPlayersByScore(): Player[] {
    return this.players().sort((a, b) => {
      const scoreA = this.gameState().scores[a.id] || 0;
      const scoreB = this.gameState().scores[b.id] || 0;
      return scoreB - scoreA;
    });
  }

  async nextRound() {
    if (!this.isHost()) return;

    const settings = this.game()?.settings as any;
    const mimicSettings = settings?.mimicSettings;
    const maxRounds = mimicSettings?.rounds || 3;

    if (this.gameState().currentRound >= maxRounds) {
      // Game end
      this.gameState.update(state => ({ ...state, gamePhase: 'GAME_END' }));
      await this.saveGameState(this.gameState());
      return;
    }

    // Next round
    const players = this.players();
    const currentActorIndex = players.findIndex(p => p.id === this.gameState().currentActor);
    const nextActorIndex = (currentActorIndex + 1) % players.length;
    const nextActor = players[nextActorIndex];

    const availableWords = this.getAvailableWords(mimicSettings);
    const nextWord = availableWords[Math.floor(Math.random() * availableWords.length)];

    const newState: MimicGameState = {
      ...this.gameState(),
      currentWord: nextWord,
      currentActor: nextActor.id,
      currentRound: this.gameState().currentRound + 1,
      timeLeft: mimicSettings?.timeLimit || 60,
      gamePhase: 'ACTING',
      guessedWords: [],
      usedWords: [...this.gameState().usedWords, nextWord]
    };

    this.gameState.set(newState);
    this.startTimer();
    await this.saveGameState(newState);
  }

  getWinner(): Player | null {
    const playersByScore = this.getPlayersByFinalScore();
    return playersByScore[0] || null;
  }

  getWinnerScore(): number {
    const winner = this.getWinner();
    return winner ? (this.gameState().scores[winner.id] || 0) : 0;
  }

  getPlayersByFinalScore(): Player[] {
    return this.players().sort((a, b) => {
      const scoreA = this.gameState().scores[a.id] || 0;
      const scoreB = this.gameState().scores[b.id] || 0;
      return scoreB - scoreA;
    });
  }

  async playAgain() {
    // Reset game state and start over
    const newState: MimicGameState = {
      currentWord: '',
      currentActor: '',
      currentRound: 1,
      timeLeft: 60,
      gamePhase: 'WAITING',
      scores: {},
      guessedWords: [],
      usedWords: []
    };

    this.gameState.set(newState);
    await this.saveGameState(newState);

    if (this.isHost()) {
      this.startGame();
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  async saveGameState(state: MimicGameState) {
    const game = this.game();
    if (!game) return;

    await this.gameService.supabase.from('games').update({
      settings: {
        ...game.settings,
        gameState: state
      }
    }).eq('id', game.id);
  }
}
