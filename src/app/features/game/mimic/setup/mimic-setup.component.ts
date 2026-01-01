import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '../../../../core/services/game.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MIMIC_CATEGORIES, MimicCategory } from '../../../../core/data/mimic-words';

interface MimicSettings {
  categories: string[];
  maxPlayers: number;
  rounds: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

@Component({
  selector: 'app-mimic-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mimic-setup-container fade-in">
      <!-- Header -->
      <header class="setup-header">
        <button class="back-btn" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          VOLVER
        </button>
        <h1>Configurar Mímica</h1>
        <p>¡Actúa sin palabras! ¿Podrás hacer reír a tus amigos?</p>
      </header>

      <div class="setup-content">
        <!-- Categories Selection -->
        <section class="setup-section">
          <h2>🎭 Categorías</h2>
          <p class="section-desc">Elige las categorías de palabras para jugar</p>

          <div class="categories-grid">
            <div class="category-card"
                 *ngFor="let category of categories()"
                 [class.selected]="isCategorySelected(category.id)"
                 (click)="toggleCategory(category.id)">
              <div class="category-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="getIconPath(category.icon)"></path>
                </svg>
              </div>
              <h3>{{ category.name }}</h3>
              <span class="word-count">{{ category.words.length }} palabras</span>
            </div>
          </div>

          <div class="selection-summary">
            <span class="summary-text">{{ getSelectedCategoriesText() }}</span>
            <span class="total-words">{{ getTotalWords() }} palabras totales</span>
          </div>
        </section>

        <!-- Game Settings -->
        <section class="setup-section">
          <h2>⚙️ Configuración del Juego</h2>

          <div class="settings-grid">
            <!-- Max Players -->
            <div class="setting-item">
              <label>Jugadores Máximos</label>
              <div class="number-controls">
                <button (click)="adjustMaxPlayers(-1)" [disabled]="settings().maxPlayers <= 2">-</button>
                <span>{{ settings().maxPlayers }}</span>
                <button (click)="adjustMaxPlayers(1)" [disabled]="settings().maxPlayers >= 12">+</button>
              </div>
            </div>

            <!-- Rounds -->
            <div class="setting-item">
              <label>Rondas</label>
              <div class="number-controls">
                <button (click)="adjustRounds(-1)" [disabled]="settings().rounds <= 1">-</button>
                <span>{{ settings().rounds }}</span>
                <button (click)="adjustRounds(1)" [disabled]="settings().rounds >= 10">+</button>
              </div>
            </div>

            <!-- Time Limit -->
            <div class="setting-item">
              <label>Tiempo por Turno (segundos)</label>
              <div class="number-controls">
                <button (click)="adjustTimeLimit(-10)" [disabled]="settings().timeLimit <= 30">-</button>
                <span>{{ settings().timeLimit }}</span>
                <button (click)="adjustTimeLimit(10)" [disabled]="settings().timeLimit >= 180">+</button>
              </div>
            </div>

            <!-- Difficulty -->
            <div class="setting-item">
              <label>Dificultad</label>
              <div class="difficulty-options">
                <button
                  *ngFor="let option of difficultyOptions"
                  [class.selected]="settings().difficulty === option.value"
                  (click)="setDifficulty(option.value)">
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Preview -->
        <section class="setup-section">
          <h2>🎯 Vista Previa</h2>
          <div class="preview-card">
            <div class="preview-header">
              <span class="preview-icon">🎭</span>
              <span class="preview-title">MÍMICA</span>
            </div>
            <div class="preview-stats">
              <div class="stat">
                <span class="stat-label">Categorías:</span>
                <span class="stat-value">{{ settings().categories.length }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Palabras:</span>
                <span class="stat-value">{{ getTotalWords() }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Rondas:</span>
                <span class="stat-value">{{ settings().rounds }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Tiempo:</span>
                <span class="stat-value">{{ settings().timeLimit }}s</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Action Footer -->
      <div class="setup-actions">
        <button
          class="modern-button primary"
          [disabled]="settings().categories.length === 0"
          (click)="createGame()">
          CREAR PARTIDA
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mimic-setup-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      min-height: calc(100vh - 200px);
    }

    .setup-header { text-align: center; margin-bottom: 40px; }
    .back-btn {
      position: absolute; left: 20px; top: 20px;
      background: rgba(255,255,255,0.1); border: 1px solid var(--border-color);
      padding: 10px 16px; border-radius: 8px; color: #fff; font-size: 0.9rem;
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      transition: all 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.15); }

    .setup-header h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .setup-header p { color: var(--text-secondary); font-size: 1.1rem; }

    .setup-content { display: flex; flex-direction: column; gap: 40px; }

    .setup-section h2 {
      font-size: 1.5rem; margin-bottom: 10px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-desc { color: var(--text-secondary); margin-bottom: 20px; }

    .categories-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;
    }
    .category-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);
      padding: 20px; border-radius: 12px; cursor: pointer; transition: all 0.3s;
      text-align: center;
    }
    .category-card:hover { transform: translateY(-2px); border-color: var(--accent-primary); }
    .category-card.selected { border-color: var(--accent-primary); background: rgba(255,255,255,0.08); }

    .category-icon {
      font-size: 2rem; margin-bottom: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .category-icon svg { width: 32px; height: 32px; }
    .category-card h3 { font-size: 1rem; margin-bottom: 5px; }
    .word-count { font-size: 0.8rem; color: var(--text-secondary); }

    .selection-summary {
      margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.02);
      border-radius: 8px; display: flex; justify-content: space-between; align-items: center;
    }
    .summary-text { color: var(--text-secondary); }
    .total-words { font-weight: bold; color: var(--accent-primary); }

    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }

    .setting-item { display: flex; flex-direction: column; gap: 10px; }
    .setting-item label { font-weight: 600; color: var(--text-secondary); }

    .number-controls {
      display: flex; align-items: center; gap: 15px; justify-content: center;
    }
    .number-controls button {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.1); border: 1px solid var(--border-color);
      color: #fff; font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
    }
    .number-controls button:hover:not(:disabled) { background: var(--accent-primary); }
    .number-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
    .number-controls span { font-size: 1.2rem; font-weight: bold; min-width: 30px; text-align: center; }

    .difficulty-options { display: flex; gap: 10px; }
    .difficulty-options button {
      flex: 1; padding: 10px; border-radius: 6px;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
      color: #fff; cursor: pointer; transition: all 0.2s;
    }
    .difficulty-options button.selected { background: var(--accent-primary); border-color: var(--accent-primary); }

    .preview-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);
      padding: 25px; border-radius: 12px;
    }
    .preview-header {
      display: flex; align-items: center; gap: 15px; margin-bottom: 20px;
      padding-bottom: 15px; border-bottom: 1px solid var(--border-color);
    }
    .preview-icon { font-size: 2rem; }
    .preview-title { font-size: 1.5rem; font-weight: bold; }

    .preview-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .stat { display: flex; justify-content: space-between; align-items: center; }
    .stat-label { color: var(--text-secondary); }
    .stat-value { font-weight: bold; color: var(--accent-primary); }

    .setup-actions {
      margin-top: 40px; text-align: center;
    }
    .modern-button {
      background: var(--accent-primary); color: #000; font-weight: 800;
      padding: 15px 40px; border-radius: 30px; border: none; font-size: 1.1rem;
      cursor: pointer; transition: all 0.3s;
    }
    .modern-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255,255,255,0.1); }
    .modern-button:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 768px) {
      .mimic-setup-container { padding: 15px; }
      .categories-grid { grid-template-columns: 1fr; }
      .settings-grid { grid-template-columns: 1fr; }
      .preview-stats { grid-template-columns: 1fr; }
    }
  `]
})
export class MimicSetupComponent implements OnInit {
  categories = signal<MimicCategory[]>(MIMIC_CATEGORIES);
  settings = signal<MimicSettings>({
    categories: [],
    maxPlayers: 6,
    rounds: 3,
    timeLimit: 60,
    difficulty: 'medium'
  });

  difficultyOptions = [
    { value: 'easy' as const, label: 'FÁCIL' },
    { value: 'medium' as const, label: 'MEDIO' },
    { value: 'hard' as const, label: 'DIFÍCIL' }
  ];

  constructor(
    private router: Router,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Initialize with first category selected
    if (this.categories().length > 0) {
      this.toggleCategory(this.categories()[0].id);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.settings().categories.includes(categoryId);
  }

  toggleCategory(categoryId: string) {
    const currentCategories = this.settings().categories;
    if (currentCategories.includes(categoryId)) {
      this.settings.update(s => ({
        ...s,
        categories: currentCategories.filter(id => id !== categoryId)
      }));
    } else {
      this.settings.update(s => ({
        ...s,
        categories: [...currentCategories, categoryId]
      }));
    }
  }

  getSelectedCategoriesText(): string {
    const count = this.settings().categories.length;
    if (count === 0) return 'Ninguna categoría seleccionada';
    if (count === 1) return '1 categoría seleccionada';
    return `${count} categorías seleccionadas`;
  }

  getTotalWords(): number {
    return this.categories()
      .filter(cat => this.settings().categories.includes(cat.id))
      .reduce((total, cat) => total + cat.words.length, 0);
  }

  adjustMaxPlayers(delta: number) {
    this.settings.update(s => ({
      ...s,
      maxPlayers: Math.max(2, Math.min(12, s.maxPlayers + delta))
    }));
  }

  adjustRounds(delta: number) {
    this.settings.update(s => ({
      ...s,
      rounds: Math.max(1, Math.min(10, s.rounds + delta))
    }));
  }

  adjustTimeLimit(delta: number) {
    this.settings.update(s => ({
      ...s,
      timeLimit: Math.max(30, Math.min(180, s.timeLimit + delta))
    }));
  }

  setDifficulty(value: 'easy' | 'medium' | 'hard') {
    this.settings.update(s => ({ ...s, difficulty: value }));
  }

  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H10z',
      'film': 'M7 4v16l13-8z',
      'music': 'M9 18V5l12-2v13',
      'soccer': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-6 8z',
      'paw': 'M18 11c-1.5 0-2.5.5-3.5 1.5-.5.5-1.5 1-2.5 1s-2-.5-3-1c-1-.5-2-1-3.5-1C3.5 11 2 12 2 13.5S3.5 16 5 16c1 0 2-.5 3-1 .5-.5 1.5-1 2.5-1s2 .5 3 1c1 .5 2 1 3 1s1.5-1 1.5-2.5S19.5 11 18 11z',
      'hamburger': 'M3 12h18l-3 3H6l-3-3zm0-6h18l-3 3H6L3 6z',
      'briefcase': 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16m8 0H8m8 0h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4m-8 0H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4',
      'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      'globe': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15l2-2m0 0l2-2m-2 2v-4m0-4v4',
      'smile': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'
    };
    return icons[iconName] || '';
  }

  async createGame() {
    if (this.settings().categories.length === 0) return;

    try {
      const game = await this.gameService.createGame('NORMAL', {
        ...this.settings(),
        game_type: 'MIMIC'
      });

      this.router.navigate(['/game/lobby', game.id]);
    } catch (error) {
      console.error('Error creating mimic game:', error);
      alert('Error al crear la partida: ' + error);
    }
  }
}
