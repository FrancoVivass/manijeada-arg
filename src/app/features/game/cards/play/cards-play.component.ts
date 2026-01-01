import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../../core/services/game.service';
import { Game, Player, GameMode } from '../../../../core/models/game.models';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

interface PlayingCard {
  value: number;
  suit: string;
  image: string;
  revealed?: boolean;
}

@Component({
  selector: 'app-cards-play',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in play-screen">
      <!-- Game Info Bar -->
      <div class="game-info-bar">
        <div class="current-player-tag">
          <span class="dot"></span>
          Turno de: <strong>{{ currentTurnPlayer().display_name }}</strong>
        </div>
        <div class="game-mode-tag">
          {{ getGameModeLabel() }}
        </div>
        <div class="shots-tag">
          {{ myPlayer()?.shots_count || 0 }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-icon"><path d="M5 2h14l-2 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 2z"/><line x1="12" x2="12" y1="6" y2="18"/></svg>
        </div>
      </div>

      <div class="main-play-area">
        <!-- MAYOR O MENOR MODE -->
        <div class="card-game-container" *ngIf="game()?.mode === 'MAYOR_MENOR'">
          <div class="cards-display">
            <!-- Current Card -->
            <div class="playing-card current-card" [class.revealed]="currentCard()">
              <div class="card-inner">
                <div class="card-front" *ngIf="currentCard()">
                  <div class="card-value">{{ getCardDisplayValue(currentCard()!) }}</div>
                  <div class="card-suit" [innerHTML]="getCardSuitIcon(currentCard()!)"></div>
                </div>
                <div class="card-back" *ngIf="!currentCard()">
                  <div class="card-pattern"></div>
                </div>
              </div>
            </div>

            <div class="vs-divider">VS</div>

            <!-- Next Card Placeholder -->
            <div class="playing-card next-card" [class.revealed]="revealedCard()">
              <div class="card-inner">
                <div class="card-front" *ngIf="revealedCard()">
                  <div class="card-value">{{ getCardDisplayValue(revealedCard()!) }}</div>
                  <div class="card-suit" [innerHTML]="getCardSuitIcon(revealedCard()!)"></div>
                </div>
                <div class="card-back">
                  <div class="card-pattern">?</div>
                </div>
              </div>
            </div>
          </div>

          <div class="game-controls" *ngIf="isMyTurn() && !resultMessage()">
            <h3>¿La que sigue es...?</h3>
            <div class="control-buttons">
              <button (click)="makeGuess('HIGHER')" class="control-btn higher">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M18 15l-6-6-6 6"/></svg>
                MAYOR
              </button>
              <button (click)="makeGuess('LOWER')" class="control-btn lower">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M6 9l6 6 6-6"/></svg>
                MENOR
              </button>
            </div>
          </div>

          <!-- Result Overlay -->
          <div class="result-box fade-in" *ngIf="resultMessage()">
            <h2 [class.success]="isWin()" [class.danger]="!isWin()">
              {{ isWin() ? '¡ZAFASTE!' : '¡ADENTRO!' }}
            </h2>
            <p>{{ resultMessage() }}</p>
            <button (click)="finishTurn()" class="modern-button" *ngIf="isMyTurn()">SIGUIENTE</button>
            <p class="wait-msg" *ngIf="!isMyTurn()">Esperando a {{ currentTurnPlayer().display_name }}...</p>
          </div>
        </div>

        <!-- ROJO O NEGRO MODE -->
        <div class="card-game-container" *ngIf="game()?.mode === 'ROJO_NEGRO'">
          <div class="cards-display single">
            <div class="playing-card revealed-card" [class.revealed]="revealedCard()">
              <div class="card-inner">
                <div class="card-front" *ngIf="revealedCard()">
                  <div class="card-value">{{ getCardDisplayValue(revealedCard()!) }}</div>
                  <div class="card-suit" [innerHTML]="getCardSuitIcon(revealedCard()!)"></div>
                </div>
                <div class="card-back">
                  <div class="card-pattern">?</div>
                </div>
              </div>
            </div>
          </div>

          <div class="game-controls" *ngIf="isMyTurn() && !resultMessage()">
            <h3>¿Qué sale?</h3>
            <div class="control-buttons">
              <button (click)="makeGuess('RED')" class="control-btn red">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="btn-icon"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                ROJO
              </button>
              <button (click)="makeGuess('BLACK')" class="control-btn black">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                NEGRO
              </button>
            </div>
          </div>

          <div class="result-box fade-in" *ngIf="resultMessage()">
            <h2 [class.success]="isWin()" [class.danger]="!isWin()">
              {{ isWin() ? '¡QUÉ SUERTE!' : '¡A COBRAR!' }}
            </h2>
            <p>{{ resultMessage() }}</p>
            <button (click)="finishTurn()" class="modern-button" *ngIf="isMyTurn()">SIGUIENTE</button>
          </div>
        </div>

        <!-- LA PIRAMIDE MODE -->
        <div class="card-game-container pyramid-mode" *ngIf="game()?.mode === 'PIRAMIDE'">
          <div class="player-hand-display" *ngIf="playerHand().length > 0">
            <h4>TUS CARTAS ({{ playerHand().length }})</h4>
            <div class="hand-cards">
              <div class="hand-card" *ngFor="let card of playerHand(); let i = index">
                <div class="card-value-only">{{ getCardDisplayValue(card) }}</div>
              </div>
            </div>
          </div>

          <div class="no-cards-notice" *ngIf="playerHand().length === 0">
            <p>Esperando tus 5 cartas...</p>
            <small style="color: var(--text-secondary); font-size: 0.7rem;">Jugadores: {{ players().length }}</small>
          </div>

          <div class="no-cards-message" *ngIf="playerHand().length === 0 && game()?.mode === 'PIRAMIDE'">
            <p>Esperando reparto de cartas...</p>
          </div>

          <div class="pyramid-grid">
            <div class="pyramid-row" *ngFor="let row of pyramidCards(); let i = index">
              <div class="pyramid-card" 
                   *ngFor="let card of row; let j = index"
                   [class.revealed]="card.revealed"
                   (click)="revealPyramidCard(i, j)">
                <div class="card-inner">
                  <div class="card-front">
                    <div class="card-value-small">{{ getCardDisplayValue(card) }}</div>
                  </div>
                  <div class="card-back">
                    <div class="level-indicator">L{{ ((game()?.settings?.pyramid_size || 5) - i) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="game-controls" *ngIf="isMyTurn() && !resultMessage()">
            <h3>Elegí una carta para dar vuelta</h3>
            <p class="text-dim">Cuanto más grande la fila, más fuerte pega...</p>
          </div>

          <div class="result-box pyramid-result fade-in" *ngIf="resultMessage()">
            <p class="rule-text">{{ resultMessage() }}</p>
            <p class="auto-turn-notice">El turno pasa automáticamente en 2 segundos...</p>
          </div>
        </div>

        <!-- SIETE LOCO MODE -->
        <div class="card-game-container siete-loco-mode" *ngIf="game()?.mode === 'SIETE_LOCO'">
          <div class="cards-display single">
            <div class="playing-card revealed-card" [class.revealed]="revealedCard()">
              <div class="card-inner">
                <div class="card-front" *ngIf="revealedCard()">
                  <div class="card-value">{{ getCardDisplayValue(revealedCard()!) }}</div>
                  <div class="card-suit" [innerHTML]="getCardSuitIcon(revealedCard()!)"></div>
                </div>
                <div class="card-back">
                  <div class="card-pattern">?</div>
                </div>
              </div>
            </div>
          </div>

          <div class="game-controls" *ngIf="isMyTurn() && !revealedCard()">
            <button (click)="drawSieteLocoCard()" class="modern-button main-action-button">SACAR CARTA</button>
          </div>

          <div class="result-box fade-in" *ngIf="resultMessage()">
            <h2 class="rule-title">REGLA</h2>
            <p class="rule-text">{{ resultMessage() }}</p>
            <button (click)="finishTurn()" class="modern-button" *ngIf="isMyTurn()">ENTENDIDO / PASAR</button>
          </div>
        </div>
      </div>

      <!-- Players List Footer -->
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
    </div>
  `,
  styles: [`
    .play-screen { height: calc(100vh - 180px); display: flex; flex-direction: column; gap: 20px; }
    .game-info-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
    .current-player-tag { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .current-player-tag .dot { width: 8px; height: 8px; background: var(--accent-primary); border-radius: 50%; box-shadow: 0 0 10px var(--accent-primary); }
    .game-mode-tag { font-size: 0.6rem; font-weight: 800; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--accent-primary); text-transform: uppercase; }
    .shots-tag { background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 20px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .tag-icon { width: 14px; height: 14px; color: var(--accent-primary); }

    .main-play-area { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }

    .card-game-container { text-align: center; width: 100%; max-width: 500px; }
    
    .cards-display { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 40px; }
    .cards-display.single { justify-content: center; }
    
    .playing-card {
      width: 140px;
      height: 200px;
      perspective: 1000px;
    }
    .card-inner {
      width: 100%; height: 100%;
      position: relative;
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }
    .revealed .card-inner { transform: rotateY(180deg); }
    
    .card-front, .card-back {
      position: absolute;
      width: 100%; height: 100%;
      backface-visibility: hidden;
      border-radius: 15px;
      border: 2px solid #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .card-front {
      background: #fff;
      color: #000;
      transform: rotateY(180deg);
    }
    .card-back {
      background: #1a1a1a;
      background-image: linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%);
      background-size: 20px 20px;
    }
    
    .card-value { font-size: 2.5rem; font-weight: 900; }
    .card-suit { font-size: 3rem; }
    .vs-divider { font-weight: 950; font-size: 1.5rem; opacity: 0.3; }

    .game-controls h3 { margin-bottom: 20px; font-size: 1.2rem; }
    .control-buttons { display: flex; gap: 15px; justify-content: center; }
    .control-btn {
      padding: 15px 30px;
      border-radius: 15px;
      border: none;
      font-weight: 900;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .control-btn:active { transform: scale(0.95); }

    .btn-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
    .higher { background: var(--success); color: #000; }
    .lower { background: var(--danger); color: #fff; }
    .red { background: #ef4444; color: #fff; }
    .black { background: #111; color: #fff; border: 1px solid #333; }

    .result-box {
      margin-top: 30px;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      border: 1px solid var(--border-color);
    }
    .result-box h2 { font-size: 2rem; font-weight: 950; margin-bottom: 10px; }
    .rule-title { color: var(--accent-primary); font-size: 1.5rem !important; }
    .rule-text { font-size: 1.3rem !important; font-weight: 700; color: #fff; }
    .success { color: var(--success); }
    .danger { color: var(--danger); }
    .wait-msg { font-style: italic; opacity: 0.6; margin-top: 15px; }

    /* PYRAMID SPECIFIC */
    .player-hand-display {
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(255,255,255,0.03);
      border-radius: 15px;
      border: 1px solid var(--border-color);
    }
    .player-hand-display h4 { font-size: 0.7rem; letter-spacing: 2px; color: var(--accent-primary); margin-bottom: 10px; }
    .hand-cards { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; max-width: 280px; margin: 0 auto; }
    .hand-card {
      width: 40px; height: 50px; border-radius: 6px;
      background: var(--bg-secondary); border: 2px solid var(--border-color);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-value-only {
      font-size: 1.2rem; font-weight: 900; color: var(--accent-primary);
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .pyramid-grid {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    .pyramid-row {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .pyramid-card {
      width: 50px;
      height: 70px;
      perspective: 1000px;
      cursor: pointer;
    }
    .pyramid-card .card-front {
      background: #fff;
      border-radius: 6px;
    }
    .pyramid-card .card-back {
      border-radius: 6px;
      background: #333;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .level-indicator {
      font-size: 1.2rem;
      font-weight: 900;
      color: rgba(255,255,255,0.2);
      /* Pirámide invertida: L1 = nivel más bajo (1 carta), L5 = nivel más alto (5 cartas) */
    }
    .card-value-small {
      font-size: 0.9rem; font-weight: 900; color: #000;
      line-height: 1;
    }

    .game-footer { height: 80px; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 20px; padding: 0 10px; }

    .auto-turn-notice {
      margin-top: 15px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-align: center;
      font-style: italic;
    }
    .players-row { flex: 1; display: flex; overflow-x: auto; gap: 16px; padding: 10px 0; }
    .p-mini { display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.3; transition: all 0.3s; }
    .p-mini.active { opacity: 1; transform: scale(1.1); }
    .p-avatar { width: 36px; height: 36px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
    .p-mini.active .p-avatar { border-color: var(--accent-primary); }
    .p-shots { font-size: 0.65rem; color: var(--text-secondary); }
    .mini-icon { width: 10px; height: 10px; opacity: 0.5; }
    .quit-game { background: none; border: 1px solid var(--border-color); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
  `]
})
export class CardPlayComponent implements OnInit {
  game = signal<Game | null>(null);
  players = signal<Player[]>([]);
  currentCard = signal<PlayingCard | null>(null);
  revealedCard = signal<PlayingCard | null>(null);
  resultMessage = signal<string>('');
  isWin = signal(false);
  pyramidCards = signal<PlayingCard[][]>([]);
  playerHand = signal<PlayingCard[]>([]);
  playerHands = signal<{ [playerId: string]: PlayingCard[] }>({});
  sieteLocoRule = signal<string>('');
  revealedCardsCount = signal(0);
  loading = signal(false);

  suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Solo números del 1 al 12

  constructor(
    private gameService: GameService,
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

  ngOnDestroy() {
    // Limpiar cualquier suscripción si es necesario
  }

  async loadGame(gameId: string) {
    const { data: game } = await this.gameService.supabase.from('games').select('*').eq('id', gameId).single();
    if (game) {
      this.game.set(game);
      this.gameService.refreshPlayers(gameId);
      this.gameService.getPlayersObservable().subscribe(players => this.players.set(players));

      // Sincronización de acciones de cartas
      this.gameService.supabase.client
        .channel(`card_sync:${gameId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sessions',
          filter: `game_id=eq.${gameId}` 
        }, (payload: any) => {
          this.handleRemoteAction(payload.new);
        })
        .subscribe();

      // Generar primera carta si soy host
      if (this.isHost()) {
        if (this.game()?.mode === 'PIRAMIDE' && this.pyramidCards().length === 0) {
          this.generatePyramid();
          setTimeout(() => this.dealInitialHands(), 1000); // Dar tiempo para que todos se conecten
        } else if (!this.currentCard()) {
          this.drawInitialCard();
        }
      }
    }
  }

  isHost() {
    return this.game()?.host_id === this.authService.currentUser()?.id;
  }

  myPlayer() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return null;

    // Encontrar por user_id
    const player = this.players().find(p => p.user_id === currentUser.id);

    return player;
  }

  currentTurnPlayer() {
    const turnId = this.game()?.current_turn_player_id;
    return this.players().find(p => p.id === turnId) || this.players()[0];
  }

  isMyTurn() {
    return this.currentTurnPlayer()?.user_id === this.authService.currentUser()?.id;
  }

  getGameModeLabel() {
    const mode = this.game()?.mode;
    switch(mode) {
      case 'MAYOR_MENOR': return 'Mayor o Menor';
      case 'ROJO_NEGRO': return 'Rojo o Negro';
      case 'PIRAMIDE': return 'La Pirámide';
      case 'SIETE_LOCO': return 'Siete Loco';
      default: return 'Duelo de Cartas';
    }
  }

  generatePyramid() {
    const settings = (this.game()?.settings as any) || {};
    const size = settings.pyramid_size || 5;
    const rows = [];

    // Generar pirámide correcta: punta arriba (1 carta) a base abajo (5 cartas)
    for (let i = size; i >= 1; i--) {
      const row = [];
      for (let j = 0; j < i; j++) {
        row.push({ ...this.generateRandomCard(), revealed: false });
      }
      rows.push(row);
    }
    this.pyramidCards.set(rows);
    this.revealedCardsCount.set(0); // Resetear contador al generar nueva pirámide
    this.syncCardAction('GENERATE_PYRAMID', rows);
  }

  async dealInitialHands() {
    const hands: { [playerId: string]: PlayingCard[] } = {};
    this.players().forEach(p => {
      const cards = [
        this.generateRandomCard(),
        this.generateRandomCard(),
        this.generateRandomCard(),
        this.generateRandomCard(),
        this.generateRandomCard()
      ];
      hands[p.id] = cards;
    });

    // El host también recibe sus cartas inmediatamente
    const myPlayer = this.myPlayer();
    const myId = myPlayer?.id;

    if (myId && hands[myId]) {
      this.playerHand.set(hands[myId]);
    }

    this.syncCardAction('DEAL_HANDS', hands);
  }

  async revealPyramidCard(rowIndex: number, cardIndex: number) {
    if (!this.isMyTurn()) return;
    const cards = [...this.pyramidCards()];
    const card = cards[rowIndex][cardIndex];
    if (card.revealed) return;

    card.revealed = true;
    this.pyramidCards.set(cards);

    // Incrementar contador de cartas reveladas
    const currentRevealCount = this.revealedCardsCount() + 1;
    this.revealedCardsCount.set(currentRevealCount);

    const settings = (this.game()?.settings as any) || {};
    const initialShots = settings.starting_shots || 1;
    const pyramidSize = settings.pyramid_size || 5;

    // Calcular tragos según el contador de revelaciones (no por nivel)
    let shotsCount: string | number;
    const totalCards = (pyramidSize * (pyramidSize + 1)) / 2; // Total de cartas en la pirámide
    const isLastCard = currentRevealCount === totalCards;

    if (isLastCard) {
      shotsCount = 'FONDO BLANCO';
    } else {
      // Multiplicar x2 cada 2 cartas: 1era=1, 2da=1, 3era=2, 4ta=2, 5ta=4, 6ta=4, etc.
      shotsCount = initialShots * Math.pow(2, Math.floor((currentRevealCount - 1) / 2));
    }

    // Verificar si el jugador actual tiene esta carta en su mano (solo por valor/numero)
    const myHand = this.playerHand();
    const hasCard = myHand.some(handCard =>
      handCard.value === card.value
    );

    let msg = `Carta ${currentRevealCount}: Salió el ${this.getCardDisplayValue(card)}. `;

    if (hasCard) {
      if (isLastCard) {
        // Para fondo blanco, revisar qué jugadores tienen esta carta
        const playersWithCard = this.players().filter(p =>
          this.playerHands()?.[p.id]?.some((handCard: PlayingCard) =>
            handCard.value === card.value
          )
        );

        // Aplicar fondo blanco a todos los jugadores que tienen la carta
        for (const player of playersWithCard) {
          await this.applyShots(player, 99); // Número alto para fondo blanco
        }

        const playerNames = playersWithCard.map(p => p.display_name).join(', ');
        msg += `¡FONDO BLANCO para ${playerNames}! 💀`;
      } else {
        // Alternar TOMAR y DAR: 1ra carta TOMAR, 2da DAR, 3ra TOMAR, 4ta DAR, etc.
        const actionType = currentRevealCount % 2 !== 0 ? 'TOMAR' : 'DAR';

        if (actionType === 'TOMAR') {
          msg += `¡TENÉS ESTA CARTA! TOMÁS ${shotsCount} ${shotsCount === 1 ? 'trago' : 'tragos'}`;
          await this.applyShots(this.myPlayer()!, shotsCount as number);
        } else {
          // Para DAR: elegir automáticamente al siguiente jugador
          const currentPlayerIndex = this.players().findIndex(p => p.id === this.myPlayer()?.id);
          const nextPlayerIndex = (currentPlayerIndex + 1) % this.players().length;
          const targetPlayer = this.players()[nextPlayerIndex];

          msg += `¡TENÉS ESTA CARTA! DAS ${shotsCount} ${shotsCount === 1 ? 'trago' : 'tragos'} a ${targetPlayer.display_name}`;
          await this.applyShots(targetPlayer, shotsCount as number);

          // Notificar a todos
          this.syncCardAction('GIVE_SHOTS', {
            fromPlayer: this.myPlayer()?.display_name || 'Jugador',
            toPlayer: targetPlayer.display_name,
            shots: shotsCount,
            message: msg
          });
        }
      }
    } else {
      msg += `Nadie tiene esta carta. Siguiente turno.`;
    }

    this.resultMessage.set(msg);
    this.syncCardAction('REVEAL_PYRAMID', {
      rowIndex, cardIndex, cards, msg, card, hasCard, shotsCount, isLastCard, currentRevealCount
    });

    // Siempre pasar turno automáticamente después de revelar una carta
    setTimeout(() => this.nextTurn(), 2000); // Pequeño delay para que se lea el mensaje
  }

  async drawSieteLocoCard() {
    if (!this.isMyTurn()) return;
    const card = this.generateRandomCard();
    this.revealedCard.set(card);
    
    const rules: { [key: number]: string } = {
      1: 'CASCADA: Todos empiezan a tomar, vos decidís cuando para el de tu derecha.',
      2: 'TU TOMAS: Elegí a alguien para que tome un shot.',
      3: 'YO TOMO: Tomate un shot vos solito.',
      4: 'MARCAS: Decí una marca de algo. El que repite o tarda, toma.',
      5: 'HOMBRE: Todos los hombres toman un shot.',
      6: 'MUJER: Todas las mujeres toman un shot.',
      7: 'SIETE LOCO: Empiezan a contar números salteando el 7 y múltiplos.',
      8: 'REGLA: Creá una regla que dure toda la partida.',
      9: 'VICKY: El último en tocar la mesa toma.',
      10: 'SHOTS: Todos los que tengan menos de 20% de batería toman.',
      11: 'DEDO: Pone un dedo en la mesa, el último en imitarte toma.',
      12: 'PREGUNTA: Hacé una pregunta a alguien, tiene que responder con otra pregunta.',
      13: 'REY: Fondo blanco de lo que estés tomando.'
    };

    const rule = rules[card.value] || 'Sin regla especial, pasamos de turno.';
    this.sieteLocoRule.set(rule);
    this.resultMessage.set(rule);
    
    this.syncCardAction('SIETE_LOCO_DRAW', { card, rule });
  }

  generateRandomCard(): PlayingCard {
    const value = this.values[Math.floor(Math.random() * this.values.length)];
    const suit = this.suits[Math.floor(Math.random() * this.suits.length)];
    return { value, suit, image: '' };
  }

  async drawInitialCard() {
    if (!this.isMyTurn()) return;
    const card = this.generateRandomCard();
    this.currentCard.set(card);
    await this.syncCardAction('INITIAL_CARD', card);
  }

  async makeGuess(guess: string) {
    if (!this.isMyTurn()) return;
    
    const nextCard = this.generateRandomCard();
    this.revealedCard.set(nextCard);
    
    let win = false;
    const current = this.currentCard()!;
    
    if (this.game()?.mode === 'MAYOR_MENOR') {
      if (guess === 'HIGHER') win = nextCard.value > current.value;
      if (guess === 'LOWER') win = nextCard.value < current.value;
      if (nextCard.value === current.value) win = false; // Empate pierde
    } else if (this.game()?.mode === 'ROJO_NEGRO') {
      const isRed = nextCard.suit === 'hearts' || nextCard.suit === 'diamonds';
      win = (guess === 'RED' && isRed) || (guess === 'BLACK' && !isRed);
    }

    this.isWin.set(win);
    const msg = win ? '¡Zafaste de pedo!' : '¡Perdiste, pichón! Te toca mandar 2 shots al buche.';
    this.resultMessage.set(msg);

    if (!win) {
      await this.applyShots(this.myPlayer()!, 2);
    }

    await this.syncCardAction('GUESS_RESULT', { guess, nextCard, win, msg });
  }

  async syncCardAction(type: string, data: any) {
    await this.gameService.supabase.from('sessions').insert({
      game_id: this.game()!.id,
      player_id: this.myPlayer()?.id,
      action_type: type,
      action_description: JSON.stringify(data),
      was_completed: true
    });
  }

  handleRemoteAction(session: any) {
    // Procesar siempre las actualizaciones iniciales (pirámide y cartas)
    const isInitialUpdate = ['GENERATE_PYRAMID', 'DEAL_HANDS', 'INITIAL_CARD'].includes(session.action_type);

    if (!isInitialUpdate && this.isMyTurn()) return;

    try {
      const data = JSON.parse(session.action_description);
      if (session.action_type === 'INITIAL_CARD') {
        this.currentCard.set(data);
      } else if (session.action_type === 'GENERATE_PYRAMID') {
        this.pyramidCards.set(data);
      } else if (session.action_type === 'DEAL_HANDS') {
        // Almacenar todas las manos de los jugadores
        this.playerHands.set(data);

        // También actualizar la mano del jugador actual
        const myPlayer = this.myPlayer();
        const myId = myPlayer?.id;

        if (myId && data[myId]) {
          this.playerHand.set(data[myId]);
        }
      } else if (session.action_type === 'REVEAL_PYRAMID') {
        this.pyramidCards.set(data.cards);
        this.resultMessage.set(data.msg);
      } else if (session.action_type === 'SIETE_LOCO_DRAW') {
        this.revealedCard.set(data.card);
        this.sieteLocoRule.set(data.rule);
        this.resultMessage.set(data.rule);
      } else if (session.action_type === 'GUESS_RESULT') {
        this.revealedCard.set(data.nextCard);
        this.isWin.set(data.win);
        this.resultMessage.set(`${this.currentTurnPlayer().display_name}: ${data.msg}`);
      } else if (session.action_type === 'GIVE_SHOTS') {
        this.resultMessage.set(data.message || `${data.fromPlayer} le dio ${data.shots} tragos a ${data.toPlayer}!`);
      } else if (session.action_type === 'FINISH_TURN') {
        this.resetTurnState();
        this.currentCard.set(data.newCard);
      }
    } catch (e) {
      console.error('Error parsing remote action', e);
    }
  }

  async finishTurn() {
    const newCard = this.revealedCard() || this.currentCard();
    this.resetTurnState();
    this.currentCard.set(newCard);
    
    await this.syncCardAction('FINISH_TURN', { newCard });
    
    // Cambiar turno real
    const currentIdx = this.players().findIndex(p => p.id === this.game()?.current_turn_player_id);
    const nextIdx = (currentIdx + 1) % this.players().length;
    await this.gameService.supabase.from('games').update({ 
      current_turn_player_id: this.players()[nextIdx].id 
    }).eq('id', this.game()!.id);
  }

  resetTurnState() {
    this.revealedCard.set(null);
    this.resultMessage.set('');
    this.sieteLocoRule.set('');
    this.revealedCardsCount.set(0); // Resetear contador cuando se reinicia
    this.playerHands.set({}); // Resetear manos de jugadores
  }

  async applyShots(player: Player, count: number) {
    const newCount = (player.shots_count || 0) + count;
    await this.gameService.supabase.from('players').update({ shots_count: newCount }).eq('id', player.id);
  }

  getCardDisplayValue(card: PlayingCard): string {
    // Mostrar números del 1 al 12 directamente (sin letras)
    return card.value.toString();
  }

  getCardSuitIcon(card: PlayingCard): string {
    switch(card.suit) {
      case 'hearts': return '<span style="color: #ef4444">❤️</span>';
      case 'diamonds': return '<span style="color: #ef4444">💎</span>';
      case 'clubs': return '♣️';
      case 'spades': return '♠️';
      default: return '';
    }
  }

  getSuitName(suit: string): string {
    switch(suit) {
      case 'hearts': return 'Corazones';
      case 'diamonds': return 'Diamantes';
      case 'clubs': return 'Tréboles';
      case 'spades': return 'Picas';
      default: return suit;
    }
  }


  async nextTurn() {
    // PROCESO REAL DE CAMBIO DE TURNO (Solo Host)
    const currentIdx = this.players().findIndex(p => p.id === this.game()?.current_turn_player_id);
    const nextIdx = (currentIdx + 1) % this.players().length;
    const nextPlayer = this.players()[nextIdx];
    await this.gameService.supabase.from('games').update({ current_turn_player_id: nextPlayer.id }).eq('id', this.game()!.id);
  }

  quitGame() {
    if (confirm('¿Cerrar partida?')) this.router.navigate(['/dashboard']);
  }
}

