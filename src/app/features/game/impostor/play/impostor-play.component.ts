import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GameService } from '../../../../core/services/game.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Game, Player } from '../../../../core/models/game.models';
import { IMPOSTOR_THEMES, ImpostorTheme } from '../../../../core/data/impostor-themes';

interface ImpostorRound {
  roundNumber: number;
  currentPlayerIndex: number;
  hints: { [playerId: string]: string };
  votes: { [voterId: string]: string };
  status: 'HINTS' | 'VOTING' | 'RESULTS';
}

interface ImpostorGameState {
  secretWord: string;
  theme: string;
  impostors: string[];
  currentRound: number;
  maxRounds: number;
  gamePhase: 'WAITING' | 'ASSIGNMENT' | 'ASSIGNMENT_VOTING' | 'PLAYING' | 'VOTING' | 'RESULTS' | 'FINISHED';
  rounds: ImpostorRound[];
  winner: 'IMPOSTORS' | 'PLAYERS' | null;
  assignmentIndex: number; // Para asignación secuencial
  assignmentVotes: { [playerId: string]: string }; // Votos después de asignación
  playersReadyForNext: string[]; // Jugadores que hicieron clic en "SEGUIR"
}

@Component({
  selector: 'app-impostor-play',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="impostor-play-container fade-in">
      <!-- Game Header -->
      <header class="game-header">
        <div class="game-info">
          <h1>🕵️‍♂️ EL IMPOSTOR</h1>
          <div class="game-stats">
            <span class="round-info">Ronda {{ gameState().currentRound }}/{{ gameState().maxRounds }}</span>
            <span class="theme-info" *ngIf="gameState().theme">🎭 {{ getThemeName() }}</span>
          </div>
        </div>
        <button class="quit-btn" (click)="quitGame()">❌</button>
      </header>

      <!-- Waiting for Players -->
      <div class="waiting-phase" *ngIf="gameState().gamePhase === 'WAITING'">
        <div class="waiting-content">
          <h2>Esperando Jugadores...</h2>
          <p>Código de partida: <strong>{{ game()?.join_code }}</strong></p>

          <div class="players-list">
            <div class="player-item" *ngFor="let player of players()">
              <span class="player-avatar">{{ player.display_name[0] }}</span>
              <span class="player-name">{{ player.display_name }}</span>
              <span class="player-status" [class.ready]="player.is_active">●</span>
            </div>
          </div>

          <button class="start-btn"
                  *ngIf="isHost() && players().length >= 4"
                  (click)="startGame()">
            🚀 INICIAR PARTIDA
          </button>

          <p class="waiting-note" *ngIf="players().length < 4">
            Necesitas al menos 4 jugadores para empezar
          </p>
        </div>
      </div>

      <!-- Secret Assignment Phase -->
      <div class="assignment-phase" *ngIf="gameState().gamePhase === 'ASSIGNMENT'">
        <div class="assignment-content">
          <div class="assignment-progress">
            <h3>Asignación de Roles</h3>
            <p>Jugador {{ gameState().assignmentIndex + 1 }} de {{ players().length }}</p>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="((gameState().assignmentIndex + 1) / players().length) * 100"></div>
            </div>
          </div>

          <!-- Mostrar asignación solo al jugador actual -->
          <div class="secret-card" *ngIf="shouldShowMyAssignment() && !isImpostor()">
            <h2>🎭 TU PALABRA SECRETA</h2>
            <div class="secret-word">{{ gameState().secretWord }}</div>
            <p class="assignment-instruction">
              No la muestres a nadie. Da pistas sin decirla directamente.
            </p>
          </div>

          <div class="impostor-card" *ngIf="shouldShowMyAssignment() && isImpostor()">
            <h2>🕵️‍♂️ SOS EL IMPOSTOR</h2>
            <div class="impostor-theme">Temática: {{ getThemeName() }}</div>
            <p class="assignment-instruction">
              Improvisa pistas sin saber la palabra secreta.
            </p>
          </div>

          <!-- Mostrar esperando a otros jugadores -->
          <div class="waiting-assignment" *ngIf="!shouldShowMyAssignment()">
            <h3>Espera tu turno...</h3>
            <p>{{ getCurrentAssignmentPlayer()?.display_name }} está viendo su asignación</p>
            <div class="waiting-spinner"></div>
          </div>

          <button class="next-btn" *ngIf="shouldShowMyAssignment()" (click)="nextAssignment()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M9 18l6-6-6-6"/></svg>
            SIGUIENTE
          </button>
        </div>
      </div>

      <!-- Assignment Voting Phase -->
      <div class="assignment-voting-phase" *ngIf="gameState().gamePhase === 'ASSIGNMENT_VOTING'">
        <div class="voting-content">
          <h2>🗳️ Votación Inicial</h2>
          <p>¿Quién crees que es el impostor basado en la primera impresión?</p>

          <div class="voting-options">
            <button class="vote-option skip-vote" (click)="submitAssignmentVote('SKIP')">
              🤔 PASAR
            </button>
            <button class="vote-option"
                    *ngFor="let player of players()"
                    [class.disabled]="player.id === myPlayer()?.id"
                    (click)="submitAssignmentVote(player.id)">
              {{ player.display_name }}
            </button>
          </div>

          <div class="voting-status" *ngIf="!hasVotedInAssignment()">
            Esperando tu voto...
          </div>
          <div class="voting-status voted" *ngIf="hasVotedInAssignment()">
            ✅ Voto enviado
          </div>

          <div class="voting-progress" *ngIf="hasVotedInAssignment()">
            <p>Votos enviados: {{ getVotesCount() }}/{{ players().length }}</p>
          </div>
        </div>
      </div>

      <!-- Game Play Phase -->
      <div class="play-phase" *ngIf="gameState().gamePhase === 'PLAYING'">
        <div class="round-info">
          <h2>Ronda {{ gameState().currentRound }}</h2>
          <p *ngIf="isMyTurnToHint()">Es tu turno para dar una pista</p>
          <p *ngIf="!isMyTurnToHint()">Esperando que {{ getCurrentHintPlayer()?.display_name }} dé su pista</p>
        </div>

        <div class="hints-display">
          <div class="hint-item"
               *ngFor="let player of players()"
               [class.my-hint]="player.id === myPlayer()?.id">
            <span class="player-name">{{ player.display_name }}</span>
            <span class="hint-text" *ngIf="getPlayerHint(player.id)">
              "{{ getPlayerHint(player.id) }}"
            </span>
            <span class="waiting-hint" *ngIf="!getPlayerHint(player.id)">
              Pensando...
            </span>
          </div>
        </div>

        <div class="hint-input" *ngIf="isMyTurnToHint()">
          <input type="text"
                 [(ngModel)]="currentHint"
                 placeholder="Da una pista corta..."
                 maxlength="50"
                 (keyup.enter)="submitHint()">
          <button (click)="submitHint()" [disabled]="!currentHint.trim()">
            📤 ENVIAR
          </button>
        </div>
      </div>

      <!-- Voting Phase -->
      <div class="voting-phase" *ngIf="gameState().gamePhase === 'VOTING'">
        <div class="voting-content">
          <h2>🗳️ ¿QUIÉN ES EL IMPOSTOR?</h2>
          <p>Vota por quién crees que miente</p>

          <div class="voting-options">
            <button class="vote-option skip-vote" (click)="submitVote('SKIP')">
              🤔 PASAR
            </button>
            <button class="vote-option"
                    *ngFor="let player of players()"
                    [class.disabled]="player.id === myPlayer()?.id"
                    (click)="submitVote(player.id)">
              {{ player.display_name }}
            </button>
          </div>

          <div class="voting-status" *ngIf="!hasVoted()">
            Esperando tu voto...
          </div>
          <div class="voting-status voted" *ngIf="hasVoted()">
            ✅ Voto enviado
          </div>
        </div>
      </div>

      <!-- Results Phase -->
      <div class="results-phase" *ngIf="gameState().gamePhase === 'RESULTS'">
        <div class="results-content">
          <h2>🎯 RESULTADOS DE LA RONDA</h2>

          <div class="impostor-reveal">
            <h3>El Impostor era:</h3>
            <div class="impostor-name" *ngFor="let impostorId of gameState().impostors">
              {{ getPlayerById(impostorId)?.display_name }}
            </div>
          </div>

          <div class="votes-summary">
            <h3>Votos:</h3>
            <div class="vote-item" *ngFor="let vote of getCurrentRoundVotes()">
              <span class="voter">{{ getPlayerById(vote.voter)?.display_name }}</span>
              <span class="arrow">→</span>
              <span class="voted-for">{{ vote.votedFor ? getPlayerById(vote.votedFor)?.display_name : 'PASÓ' }}</span>
            </div>
          </div>

          <div class="continue-section">
            <button class="continue-btn" (click)="playerContinueToNextRound()" [disabled]="isPlayerReadyForNext()">
              <svg *ngIf="!isPlayerReadyForNext()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M9 18l6-6-6-6"/></svg>
              {{ isPlayerReadyForNext() ? 'ESPERANDO A OTROS' : 'SEGUIR' }}
            </button>
            <p class="ready-count" *ngIf="isPlayerReadyForNext()">
              Listos: {{ gameState().playersReadyForNext.length }}/{{ players().length }}
            </p>
          </div>
        </div>
      </div>

      <!-- Game Finished -->
      <div class="finished-phase" *ngIf="gameState().gamePhase === 'FINISHED'">
        <div class="finished-content">
          <h2 *ngIf="gameState().winner === 'IMPOSTORS'">🕵️‍♂️ ¡GANARON LOS IMPOSTORES!</h2>
          <h2 *ngIf="gameState().winner === 'PLAYERS'">🎉 ¡GANARON LOS JUGADORES!</h2>

          <div class="penalty-info">
            <p *ngIf="gameState().winner === 'IMPOSTORS'">
              Los impostores sobreviven. Todos los demás toman <strong>3 shots</strong> cada uno.
            </p>
            <p *ngIf="gameState().winner === 'PLAYERS'">
              El impostor fue descubierto. Toma <strong>5 shots</strong>.
            </p>
          </div>

          <div class="final-impostors">
            <h3>Los Impostores eran:</h3>
            <div class="impostor-list">
              <span *ngFor="let impostorId of gameState().impostors">
                {{ getPlayerById(impostorId)?.display_name }}
              </span>
            </div>
          </div>

          <div class="final-actions">
            <button class="play-again-btn" (click)="playAgain()">
              🔄 JUGAR DE NUEVO
            </button>
            <button class="back-btn" (click)="backToDashboard()">
              🏠 VOLVER AL HUB
            </button>
          </div>
        </div>
      </div>

      <!-- Players Sidebar -->
      <aside class="players-sidebar">
        <h3>Jugadores</h3>
        <div class="player-item" *ngFor="let player of players()">
          <span class="player-avatar">{{ player.display_name[0] }}</span>
          <span class="player-name">{{ player.display_name }}</span>
          <span class="player-role" *ngIf="gameState().gamePhase === 'FINISHED' && gameState().impostors.includes(player.id)">
            🕵️‍♂️
          </span>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .impostor-play-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      grid-template-rows: auto 1fr;
      height: calc(100vh - 80px);
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

    .game-info h1 {
      font-size: 1.8rem;
      font-weight: 950;
      margin-bottom: 5px;
    }

    .game-stats {
      display: flex;
      gap: 20px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .quit-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--border-color);
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .waiting-phase, .assignment-phase, .play-phase, .voting-phase, .results-phase, .finished-phase {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .waiting-content, .assignment-content, .play-phase, .voting-content, .results-content, .finished-content {
      text-align: center;
      width: 100%;
      max-width: 600px;
    }

    .waiting-content h2 {
      font-size: 2rem;
      margin-bottom: 20px;
    }

    .players-list {
      margin: 40px 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .player-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.05);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .player-avatar {
      width: 32px;
      height: 32px;
      background: var(--accent-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #000;
    }

    .player-name {
      flex: 1;
      font-weight: 600;
    }

    .player-status {
      color: var(--text-secondary);
    }
    .player-status.ready {
      color: var(--success);
    }

    .start-btn {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 950;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .start-btn:hover { transform: scale(1.05); }

    .waiting-note {
      color: var(--text-secondary);
      margin-top: 20px;
    }

    .secret-card, .impostor-card {
      background: rgba(255,255,255,0.1);
      border: 2px solid var(--accent-primary);
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 40px;
      position: relative;
      overflow: hidden;
    }

    .secret-card::before, .impostor-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: glow 3s ease-in-out infinite alternate;
    }

    @keyframes glow {
      0% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }

    .secret-card h2, .impostor-card h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .secret-word {
      font-size: 3rem;
      font-weight: 950;
      color: var(--accent-primary);
      margin: 20px 0;
      position: relative;
      z-index: 1;
    }

    .impostor-theme {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--danger);
      margin: 20px 0;
      position: relative;
      z-index: 1;
    }

    .assignment-instruction {
      color: var(--text-secondary);
      font-style: italic;
      position: relative;
      z-index: 1;
    }

    .ready-btn {
      background: var(--success);
      color: #000;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 950;
      font-size: 1.1rem;
      cursor: pointer;
    }

    .assignment-progress {
      text-align: center;
      margin-bottom: 40px;
    }

    .assignment-progress h3 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .assignment-progress p {
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .progress-bar {
      width: 100%;
      max-width: 300px;
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      margin: 0 auto;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent-primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .waiting-assignment {
      text-align: center;
      padding: 40px;
    }

    .waiting-assignment h3 {
      font-size: 1.3rem;
      margin-bottom: 15px;
    }

    .waiting-assignment p {
      color: var(--text-secondary);
      margin-bottom: 30px;
    }

    .waiting-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .next-btn {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 950;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .next-btn:hover { transform: scale(1.05); }

    .btn-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    .assignment-voting-phase {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .voting-progress {
      margin-top: 20px;
      text-align: center;
    }

    .voting-progress p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .continue-section {
      text-align: center;
      margin-top: 20px;
    }

    .ready-count {
      margin-top: 15px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .continue-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .round-info h2 {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .round-info p {
      color: var(--text-secondary);
      margin-bottom: 30px;
    }

    .hints-display {
      display: grid;
      gap: 15px;
      margin: 40px 0;
    }

    .hint-item {
      display: flex;
      align-items: center;
      gap: 15px;
      background: rgba(255,255,255,0.05);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .hint-item.my-hint {
      border-color: var(--accent-primary);
      background: rgba(var(--accent-primary-rgb), 0.1);
    }

    .hint-text {
      flex: 1;
      font-style: italic;
      color: var(--accent-primary);
    }

    .waiting-hint {
      flex: 1;
      color: var(--text-secondary);
      font-style: italic;
    }

    .hint-input {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }

    .hint-input input {
      flex: 1;
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 15px;
      color: #fff;
      font-size: 1.1rem;
    }

    .hint-input button {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 15px 25px;
      border-radius: 8px;
      font-weight: 900;
      cursor: pointer;
    }
    .hint-input button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .voting-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 30px 0;
    }

    .vote-option {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }

    .vote-option:hover:not(.disabled) {
      border-color: var(--accent-primary);
      background: rgba(var(--accent-primary-rgb), 0.1);
    }

    .vote-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .skip-vote {
      background: rgba(255,255,255,0.03);
      border-style: dashed;
    }

    .voting-status {
      margin-top: 20px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .voting-status.voted {
      color: var(--success);
    }

    .impostor-reveal {
      margin: 30px 0;
    }

    .impostor-reveal h3 {
      margin-bottom: 15px;
      color: var(--danger);
    }

    .impostor-name {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--danger);
      margin: 5px 0;
    }

    .votes-summary {
      margin: 30px 0;
    }

    .votes-summary h3 {
      margin-bottom: 15px;
    }

    .vote-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.03);
      padding: 10px;
      border-radius: 6px;
      margin: 5px 0;
    }

    .continue-btn {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 950;
      cursor: pointer;
      margin-top: 20px;
    }

    .finished-content h2 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }

    .penalty-info {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }

    .penalty-info p {
      font-size: 1.1rem;
      margin: 0;
    }

    .final-impostors {
      margin: 30px 0;
    }

    .impostor-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-top: 15px;
    }

    .impostor-list span {
      background: var(--danger);
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
    }

    .final-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 40px;
    }

    .play-again-btn {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 950;
      cursor: pointer;
    }

    .back-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .players-sidebar {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }

    .players-sidebar h3 {
      margin-bottom: 20px;
      font-size: 1.1rem;
      color: var(--accent-primary);
    }

    @media (max-width: 768px) {
      .impostor-play-container {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
      }

      .players-sidebar {
        grid-row: 2;
        grid-column: 1;
      }

      .waiting-phase, .assignment-phase, .play-phase, .voting-phase, .results-phase, .finished-phase {
        padding: 20px;
      }

      .voting-options {
        grid-template-columns: 1fr;
      }

      .final-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ImpostorPlayComponent implements OnInit, OnDestroy {
  game = signal<Game | null>(null);
  players = signal<Player[]>([]);
  gameState = signal<ImpostorGameState>({
    secretWord: '',
    theme: '',
    impostors: [],
    currentRound: 1,
    maxRounds: 5,
    gamePhase: 'WAITING',
    rounds: [],
    winner: null,
    assignmentIndex: 0,
    assignmentVotes: {},
    playersReadyForNext: []
  });

  currentHint = '';

  constructor(
    private gameService: GameService,
    private authService: AuthService,
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
    // Cleanup subscriptions
  }

  async loadGame(gameId: string) {
    const { data: game } = await this.gameService.supabase.from('games').select('*').eq('id', gameId).single();
    if (game) {
      this.game.set(game);
      this.gameService.refreshPlayers(gameId);
      this.gameService.getPlayersObservable().subscribe(players => this.players.set(players));

      // Initialize game state from settings
      const settings = game.settings as any;
      const gameStateData = settings.gameState || {};
      this.gameState.set({
        secretWord: gameStateData.secretWord || '',
        theme: settings.theme,
        impostors: gameStateData.impostors || [],
        currentRound: gameStateData.currentRound || 1,
        maxRounds: settings.rounds || 5,
        gamePhase: gameStateData.gamePhase || 'WAITING',
        rounds: gameStateData.rounds || [],
        winner: gameStateData.winner || null,
        assignmentIndex: gameStateData.assignmentIndex || 0,
        assignmentVotes: gameStateData.assignmentVotes || {},
        playersReadyForNext: gameStateData.playersReadyForNext || []
      });

      // Listen for game updates
      this.gameService.supabase.client
        .channel(`impostor_game:${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        }, (payload: any) => {
          const updatedGame = payload.new as Game;
          this.game.set(updatedGame);

          // Update game state from game data
          const gameStateData = updatedGame.settings as any;
          if (gameStateData.gameState) {
            this.gameState.set(gameStateData.gameState);
          }
        })
        .subscribe();
    }
  }

  isHost() {
    return this.game()?.host_id === this.authService.currentUser()?.id;
  }

  myPlayer() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return null;

    return this.players().find(p => p.user_id === currentUser.id);
  }

  isImpostor(): boolean {
    const myPlayer = this.myPlayer();
    return myPlayer ? this.gameState().impostors.includes(myPlayer.id) : false;
  }

  getThemeName(): string {
    const theme = IMPOSTOR_THEMES.find(t => t.id === this.gameState().theme);
    return theme ? theme.name : this.gameState().theme;
  }

  async startGame() {
    if (!this.isHost()) return;

    const game = this.game();
    if (!game) return;

    let selectedTheme: ImpostorTheme | undefined;
    let secretWord: string;

    // Si se seleccionó "todas-random", elegir una temática al azar
    if (this.gameState().theme === 'todas-random') {
      // Elegir una temática al azar (excluyendo random y todas-random)
      const availableThemes = IMPOSTOR_THEMES.filter(t =>
        t.id !== 'todas-random' && t.id !== 'random'
      );
      selectedTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
      secretWord = selectedTheme!.words[Math.floor(Math.random() * selectedTheme!.words.length)];

      // Actualizar el estado para mostrar la temática elegida
      this.gameState.update(state => ({
        ...state,
        theme: selectedTheme!.id
      }));
    } else {
      // Usar la temática seleccionada normalmente
      selectedTheme = IMPOSTOR_THEMES.find(t => t.id === this.gameState().theme);
      if (!selectedTheme) return;
      secretWord = selectedTheme!.words[Math.floor(Math.random() * selectedTheme!.words.length)];
    }

    // Asegurar que selectedTheme no sea undefined para el resto del código
    if (!selectedTheme) return;

    // Select impostors
    const settings = game.settings as any;
    const impostorCount = settings.impostorCount || 1;
    const allPlayers = [...this.players()];
    const impostors: string[] = [];

    for (let i = 0; i < impostorCount; i++) {
      const randomIndex = Math.floor(Math.random() * allPlayers.length);
      const impostor = allPlayers.splice(randomIndex, 1)[0];
      impostors.push(impostor.id);
    }

    // Update game state
    const newGameState: ImpostorGameState = {
      ...this.gameState(),
      secretWord,
      impostors,
      gamePhase: 'ASSIGNMENT',
      assignmentIndex: 0,
      assignmentVotes: {},
      playersReadyForNext: []
    };

    // Save to database
    await this.gameService.supabase.from('games').update({
      settings: {
        ...game.settings,
        gameState: newGameState
      }
    }).eq('id', game.id);
  }

  async nextAssignment() {
    const game = this.game();
    if (!game) return;

    const currentIndex = this.gameState().assignmentIndex;
    const totalPlayers = this.players().length;

    if (currentIndex < totalPlayers - 1) {
      // Pasar al siguiente jugador
      const newGameState: ImpostorGameState = {
        ...this.gameState(),
        assignmentIndex: currentIndex + 1
      };

      await this.gameService.supabase.from('games').update({
        settings: {
          ...game.settings,
          gameState: newGameState
        }
      }).eq('id', game.id);
    } else {
      // Todos han visto su asignación, pasar a votación
      const newGameState: ImpostorGameState = {
        ...this.gameState(),
        gamePhase: 'ASSIGNMENT_VOTING',
        assignmentVotes: {}
      };

      await this.gameService.supabase.from('games').update({
        settings: {
          ...game.settings,
          gameState: newGameState
        }
      }).eq('id', game.id);
    }
  }

  async submitAssignmentVote(votedFor: string) {
    const game = this.game();
    if (!game) return;

    const currentVotes = { ...this.gameState().assignmentVotes };
    currentVotes[this.myPlayer()!.id] = votedFor;

    // Check if all players have voted
    const allPlayersVoted = this.players().every(p => currentVotes[p.id]);

    if (allPlayersVoted) {
      // Todos votaron, empezar el juego
      const newGameState: ImpostorGameState = {
        ...this.gameState(),
        gamePhase: 'PLAYING',
        assignmentVotes: currentVotes,
        playersReadyForNext: [],
        rounds: [{
          roundNumber: 1,
          currentPlayerIndex: 0,
          hints: {},
          votes: {},
          status: 'HINTS'
        }]
      };

      await this.gameService.supabase.from('games').update({
        settings: {
          ...game.settings,
          gameState: newGameState
        }
      }).eq('id', game.id);
    } else {
      // Actualizar votos
      const newGameState: ImpostorGameState = {
        ...this.gameState(),
        assignmentVotes: currentVotes
      };

      await this.gameService.supabase.from('games').update({
        settings: {
          ...game.settings,
          gameState: newGameState
        }
      }).eq('id', game.id);
    }
  }

  hasVotedInAssignment(): boolean {
    return this.gameState().assignmentVotes[this.myPlayer()?.id || ''] !== undefined;
  }

  async playerContinueToNextRound() {
    const game = this.game();
    if (!game) return;

    const readyPlayers = [...this.gameState().playersReadyForNext];
    if (!readyPlayers.includes(this.myPlayer()!.id)) {
      readyPlayers.push(this.myPlayer()!.id);
    }

    // Check if all players are ready
    const allPlayersReady = this.players().every(p => readyPlayers.includes(p.id));

    if (allPlayersReady) {
      // Todos listos, pasar a siguiente ronda o terminar
      if (this.gameState().currentRound >= this.gameState().maxRounds) {
        // Juego terminado, impostores ganan por sobrevivir
        await this.endGame('IMPOSTORS');
      } else {
        // Pasar a siguiente ronda
        const nextRound: ImpostorRound = {
          roundNumber: this.gameState().currentRound + 1,
          currentPlayerIndex: 0,
          hints: {},
          votes: {},
          status: 'HINTS'
        };

        const newGameState: ImpostorGameState = {
          ...this.gameState(),
          currentRound: this.gameState().currentRound + 1,
          gamePhase: 'PLAYING',
          playersReadyForNext: [],
          rounds: [...this.gameState().rounds, nextRound]
        };

        await this.gameService.supabase.from('games').update({
          settings: {
            ...game.settings,
            gameState: newGameState
          }
        }).eq('id', game.id);
      }
    } else {
      // Actualizar lista de jugadores listos
      const newGameState: ImpostorGameState = {
        ...this.gameState(),
        playersReadyForNext: readyPlayers
      };

      await this.gameService.supabase.from('games').update({
        settings: {
          ...game.settings,
          gameState: newGameState
        }
      }).eq('id', game.id);
    }
  }

  isPlayerReadyForNext(): boolean {
    return this.gameState().playersReadyForNext.includes(this.myPlayer()?.id || '');
  }

  getVotesCount(): number {
    return Object.keys(this.gameState().assignmentVotes).length;
  }


  getCurrentAssignmentPlayer(): Player | null {
    const players = this.players();
    const index = this.gameState().assignmentIndex;
    return players[index] || null;
  }

  shouldShowMyAssignment(): boolean {
    const currentPlayer = this.getCurrentAssignmentPlayer();
    const myPlayer = this.myPlayer();
    return currentPlayer?.id === myPlayer?.id;
  }

  isMyTurnToHint(): boolean {
    const currentRound = this.gameState().rounds[this.gameState().currentRound - 1];
    if (!currentRound) return false;

    const currentPlayer = this.players()[currentRound.currentPlayerIndex];
    return currentPlayer?.id === this.myPlayer()?.id;
  }

  getCurrentHintPlayer() {
    const currentRound = this.gameState().rounds[this.gameState().currentRound - 1];
    if (!currentRound) return null;

    return this.players()[currentRound.currentPlayerIndex];
  }

  getPlayerHint(playerId: string): string | null {
    const currentRound = this.gameState().rounds[this.gameState().currentRound - 1];
    return currentRound?.hints[playerId] || null;
  }

  async submitHint() {
    if (!this.currentHint.trim() || !this.isMyTurnToHint()) return;

    const currentRound = { ...this.gameState().rounds[this.gameState().currentRound - 1] };
    currentRound.hints[this.myPlayer()!.id] = this.currentHint.trim();

    // Check if all players have given hints
    const allPlayersGaveHints = this.players().every(p => currentRound.hints[p.id]);

    if (allPlayersGaveHints) {
      currentRound.status = 'VOTING';
    } else {
      // Move to next player
      currentRound.currentPlayerIndex = (currentRound.currentPlayerIndex + 1) % this.players().length;
    }

    const updatedRounds = [...this.gameState().rounds];
    updatedRounds[this.gameState().currentRound - 1] = currentRound;

    const newGameState: ImpostorGameState = {
      ...this.gameState(),
      rounds: updatedRounds
    };

    const game = this.game();
    if (!game) return;

    await this.gameService.supabase.from('games').update({
      settings: {
        ...game.settings,
        gameState: newGameState
      }
    }).eq('id', game.id);

    this.currentHint = '';
  }

  async submitVote(votedFor: string) {
    const currentRound = { ...this.gameState().rounds[this.gameState().currentRound - 1] };
    currentRound.votes[this.myPlayer()!.id] = votedFor;

    // Check if all players have voted
    const allPlayersVoted = this.players().every(p => currentRound.votes[p.id]);

    if (allPlayersVoted) {
      currentRound.status = 'RESULTS';
    }

    const updatedRounds = [...this.gameState().rounds];
    updatedRounds[this.gameState().currentRound - 1] = currentRound;

    const newGameState: ImpostorGameState = {
      ...this.gameState(),
      rounds: updatedRounds
    };

    const game = this.game();
    if (!game) return;

    await this.gameService.supabase.from('games').update({
      settings: {
        ...game.settings,
        gameState: newGameState
      }
    }).eq('id', game.id);
  }

  hasVoted(): boolean {
    const currentRound = this.gameState().rounds[this.gameState().currentRound - 1];
    return currentRound?.votes[this.myPlayer()?.id || ''] !== undefined;
  }

  getCurrentRoundVotes() {
    const currentRound = this.gameState().rounds[this.gameState().currentRound - 1];
    if (!currentRound) return [];

    return Object.entries(currentRound.votes).map(([voter, votedFor]) => ({
      voter,
      votedFor: votedFor === 'SKIP' ? null : votedFor
    }));
  }

  getPlayerById(playerId: string) {
    return this.players().find(p => p.id === playerId);
  }

  async continueGame() {
    const currentRound = this.gameState().rounds[this.gameState().currentRound - 1];

    // Count votes for each player
    const voteCounts: { [playerId: string]: number } = {};
    Object.values(currentRound.votes).forEach(votedFor => {
      if (votedFor && votedFor !== 'SKIP') {
        voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
      }
    });

    // Find player with most votes
    const mostVotedPlayer = Object.entries(voteCounts).reduce((a, b) =>
      voteCounts[a[0]] > voteCounts[b[0]] ? a : b
    );

    const isImpostorCaught = this.gameState().impostors.includes(mostVotedPlayer[0]);

    if (isImpostorCaught) {
      // Players win
      await this.endGame('PLAYERS');
    } else if (this.gameState().currentRound >= this.gameState().maxRounds) {
      // Impostors win by surviving all rounds
      await this.endGame('IMPOSTORS');
    } else {
      // Continue to next round
      const nextRound: ImpostorRound = {
        roundNumber: this.gameState().currentRound + 1,
        currentPlayerIndex: 0,
        hints: {},
        votes: {},
        status: 'HINTS'
      };

      const newGameState: ImpostorGameState = {
        ...this.gameState(),
        currentRound: this.gameState().currentRound + 1,
        gamePhase: 'PLAYING',
        rounds: [...this.gameState().rounds, nextRound]
      };

      const game = this.game();
      if (!game) return;

      await this.gameService.supabase.from('games').update({
        settings: {
          ...game.settings,
          gameState: newGameState
        }
      }).eq('id', game.id);
    }
  }

  async endGame(winner: 'IMPOSTORS' | 'PLAYERS') {
    const newGameState: ImpostorGameState = {
      ...this.gameState(),
      gamePhase: 'FINISHED',
      winner
    };

    // Apply shots based on winner
    if (winner === 'PLAYERS') {
      // Impostor takes 5 shots
      for (const impostorId of this.gameState().impostors) {
        const impostor = this.players().find(p => p.id === impostorId);
        if (impostor) {
          await this.gameService.supabase.from('players').update({
            shots_count: (impostor.shots_count || 0) + 5
          }).eq('id', impostor.id);
        }
      }
    } else {
      // All non-impostors take 3 shots
      for (const player of this.players()) {
        if (!this.gameState().impostors.includes(player.id)) {
          await this.gameService.supabase.from('players').update({
            shots_count: (player.shots_count || 0) + 3
          }).eq('id', player.id);
        }
      }
    }

    const game = this.game();
    if (!game) return;

    await this.gameService.supabase.from('games').update({
      status: 'FINISHED',
      settings: {
        ...game.settings,
        gameState: newGameState
      }
    }).eq('id', game.id);
  }

  playAgain() {
    // Reset game state and start over
    const resetGameState: ImpostorGameState = {
      secretWord: '',
      theme: this.gameState().theme,
      impostors: [],
      currentRound: 1,
      maxRounds: this.gameState().maxRounds,
      gamePhase: 'WAITING',
      rounds: [],
      winner: null,
      assignmentIndex: 0,
      assignmentVotes: {},
      playersReadyForNext: []
    };

    const game = this.game();
    if (!game) return;

    this.gameService.supabase.from('games').update({
      status: 'LOBBY',
      settings: {
        ...game.settings,
        gameState: resetGameState
      }
    }).eq('id', game.id);
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  quitGame() {
    if (confirm('¿Abandonar la partida?')) {
      this.router.navigate(['/dashboard']);
    }
  }
}
