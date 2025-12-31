import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '../../../../core/services/game.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IMPOSTOR_THEMES, ImpostorTheme } from '../../../../core/data/impostor-themes';


interface ImpostorSettings {
  theme: string;
  maxPlayers: number;
  impostorCount: number;
  rounds: number;
  anonymousVoting: boolean;
}

@Component({
  selector: 'app-impostor-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="impostor-setup-container fade-in">
      <!-- Header -->
      <header class="setup-header">
        <button class="back-btn" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          VOLVER
        </button>
        <h1>Configurar El Impostor</h1>
        <p>¿Quién será el impostor entre tus amigos?</p>
      </header>

      <div class="setup-content">
        <!-- Theme Selection -->
        <section class="setup-section">
          <h2>🎭 Temática</h2>
          <p class="section-desc">Elige una temática para las palabras secretas</p>

          <div class="theme-grid">
            <div class="theme-card"
                 *ngFor="let theme of themes()"
                 [class.selected]="settings().theme === theme.id"
                 [class.random-all]="theme.id === 'todas-random'"
                 (click)="selectTheme(theme.id)">
              <div class="theme-header">
                <span class="theme-category">{{ theme.category }}</span>
                <span class="theme-count">{{ theme.words.length }} palabras</span>
              </div>
              <h3>{{ theme.name }}</h3>
              <div class="theme-preview">
                <span *ngFor="let word of (theme.id === 'todas-random' ? ['CINE', 'FÚTBOL', 'COMIDAS'] : theme.words.slice(0, 3))" class="preview-word">{{ word }}</span>
                <span *ngIf="theme.id === 'todas-random'" class="preview-more">+200 palabras de todas las temáticas</span>
                <span *ngIf="theme.id !== 'todas-random' && theme.words.length > 3" class="preview-more">+{{ theme.words.length - 3 }} más</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Game Settings -->
        <section class="setup-section">
          <h2>⚙️ Configuración de Partida</h2>

          <div class="settings-grid">
            <!-- Max Players -->
            <div class="setting-card">
              <label>👥 Máximo Jugadores</label>
              <select [(ngModel)]="settings().maxPlayers" name="maxPlayers">
                <option [value]="4">4 Jugadores</option>
                <option [value]="5">5 Jugadores</option>
                <option [value]="6">6 Jugadores</option>
                <option [value]="7">7 Jugadores</option>
                <option [value]="8">8 Jugadores</option>
              </select>
            </div>

            <!-- Impostors -->
            <div class="setting-card">
              <label>🕵️‍♂️ Cantidad de Impostores</label>
              <select [(ngModel)]="settings().impostorCount" name="impostorCount">
                <option [value]="1">1 Impostor</option>
                <option [value]="2" [disabled]="settings().maxPlayers < 6">2 Impostores</option>
              </select>
            </div>

            <!-- Rounds -->
            <div class="setting-card">
              <label>🔄 Rondas Máximas</label>
              <select [(ngModel)]="settings().rounds" name="rounds">
                <option [value]="3">3 Rondas</option>
                <option [value]="5">5 Rondas</option>
                <option [value]="7">7 Rondas</option>
                <option [value]="10">10 Rondas</option>
              </select>
            </div>

            <!-- Voting -->
            <div class="setting-card">
              <label>🗳️ Votación</label>
              <div class="toggle-option">
                <input type="checkbox" id="anonymous" [(ngModel)]="settings().anonymousVoting" name="anonymousVoting">
                <label for="anonymous">Anónima</label>
              </div>
            </div>
          </div>
        </section>

        <!-- Game Rules -->
        <section class="setup-section rules-section">
          <h2>📋 Cómo se Juega</h2>
          <div class="rules-grid">
            <div class="rule-card">
              <span class="rule-icon">🎭</span>
              <h4>Asignación Secreta</h4>
              <p>Un jugador recibe "SOS EL IMPOSTOR" y la temática. Los demás reciben una palabra secreta.</p>
            </div>
            <div class="rule-card">
              <span class="rule-icon">💬</span>
              <h4>Rondas</h4>
              <p>Cada jugador da una pista corta relacionada con la palabra (o improvisa si es impostor).</p>
            </div>
            <div class="rule-card">
              <span class="rule-icon">🗳️</span>
              <h4>Votación</h4>
              <p>Los jugadores votan quién creen que es el impostor.</p>
            </div>
            <div class="rule-card">
              <span class="rule-icon">🏆</span>
              <h4>Ganador</h4>
              <p>Si descubren al impostor: él toma 5 shots. Si sobrevive: todos los demás toman 3 shots.</p>
            </div>
          </div>
        </section>

        <!-- Create Game Button -->
        <section class="action-section">
          <button class="create-game-btn"
                  (click)="createGame()"
                  [disabled]="!canCreateGame()">
            🎭 CREAR PARTIDA DEL IMPOSTOR
          </button>

        </section>
      </div>
    </div>
  `,
  styles: [`
    .impostor-setup-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .setup-header {
      text-align: center;
      margin-bottom: 50px;
    }
    .back-btn {
      position: absolute;
      left: 20px; top: 20px;
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 10px 20px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      transition: all 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.2); }
    .back-btn svg { width: 16px; height: 16px; }

    .setup-header h1 {
      font-size: 2.5rem;
      font-weight: 950;
      margin-bottom: 10px;
    }
    .setup-header p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .setup-section {
      margin-bottom: 60px;
    }
    .setup-section h2 {
      font-size: 1.8rem;
      font-weight: 900;
      margin-bottom: 10px;
    }
    .section-desc {
      color: var(--text-secondary);
      margin-bottom: 30px;
    }

    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .theme-card {
      background: rgba(255,255,255,0.05);
      border: 2px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .theme-card:hover {
      border-color: var(--accent-primary);
      transform: translateY(-2px);
    }
    .theme-card.selected {
      border-color: var(--accent-primary);
      background: rgba(var(--accent-primary-rgb), 0.1);
    }

    .theme-card.random-all {
      background: linear-gradient(135deg, rgba(var(--accent-primary-rgb), 0.1), rgba(var(--accent-secondary-rgb), 0.1));
      border: 2px solid var(--accent-primary);
      position: relative;
    }

    .theme-card.random-all::before {
      content: '🎲';
      position: absolute;
      top: -10px;
      right: -10px;
      background: var(--accent-primary);
      color: #000;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
    }

    .theme-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .theme-category {
      background: var(--accent-primary);
      color: #000;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 900;
      text-transform: uppercase;
    }
    .theme-count {
      color: var(--text-secondary);
      font-size: 0.8rem;
    }

    .theme-card h3 {
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 15px;
    }

    .theme-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .preview-word {
      background: rgba(255,255,255,0.1);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
    }
    .preview-more {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-style: italic;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .setting-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }

    .setting-card label {
      display: block;
      font-weight: 700;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }

    .setting-card select {
      width: 100%;
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      color: #fff;
      font-weight: 600;
    }

    .toggle-option {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .toggle-option input[type="checkbox"] {
      width: 20px;
      height: 20px;
    }
    .toggle-option label {
      font-weight: 600;
    }

    .rules-section {
      background: rgba(var(--accent-primary-rgb), 0.05);
      border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
      border-radius: 20px;
      padding: 40px;
    }

    .rules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .rule-card {
      text-align: center;
    }
    .rule-icon {
      font-size: 2rem;
      margin-bottom: 15px;
      display: block;
    }
    .rule-card h4 {
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .rule-card p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .action-section {
      text-align: center;
      margin-top: 60px;
    }

    .create-game-btn {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 20px 40px;
      border-radius: 16px;
      font-weight: 950;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 30px;
    }
    .create-game-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .create-game-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }


    @media (max-width: 768px) {
      .theme-grid { grid-template-columns: 1fr; }
      .settings-grid { grid-template-columns: 1fr; }
      .rules-grid { grid-template-columns: 1fr; }
      .back-btn { position: static; margin-bottom: 20px; }
    }
  `]
})
export class ImpostorSetupComponent implements OnInit {
  settings = signal<ImpostorSettings>({
    theme: '',
    maxPlayers: 6,
    impostorCount: 1,
    rounds: 5,
    anonymousVoting: true
  });

  themes = signal<ImpostorTheme[]>([]);

  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadThemes();
  }

  loadThemes() {
    // Cargar todas las temáticas
    const allThemes = IMPOSTOR_THEMES;

    // Generar la temática "TODAS LAS TEMÁTICAS" con todas las palabras
    const allWordsTheme = allThemes.find(t => t.id === 'todas-random');
    if (allWordsTheme) {
      // Combinar todas las palabras de todas las temáticas (excepto random y todas-random)
      const allWords = allThemes
        .filter(t => t.id !== 'todas-random' && t.id !== 'random')
        .flatMap(t => t.words);

      // Remover duplicados y limitar a un máximo razonable
      allWordsTheme.words = [...new Set(allWords)].slice(0, 200); // Máximo 200 palabras únicas
    }

    this.themes.set(allThemes);
  }

  selectTheme(themeId: string) {
    this.settings.update(s => ({ ...s, theme: themeId }));
  }

  canCreateGame(): boolean {
    return this.settings().theme !== '';
  }

  async createGame() {
    if (!this.canCreateGame()) return;

    try {
      const game = await this.gameService.createGame('NORMAL', {
        ...this.settings(),
        game_type: 'IMPOSTOR'
      });
      // Navegar al lobby donde se mostrará el QR
      this.router.navigate(['/game/lobby', game.id]);

    } catch (error) {
      console.error('Error creating impostor game:', error);
    }
  }


  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
