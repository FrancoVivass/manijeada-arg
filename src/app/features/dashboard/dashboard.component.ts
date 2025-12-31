import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { UserProfile, Achievement, GameMode, GameSettings, ChallengeCategory } from '../../core/models/game.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in setup-container">
      <div class="setup-header">
        <button routerLink="/dashboard" class="back-btn">← Volver al Hub</button>
        <h1>Configurar <span>Ruleta del Caos</span></h1>
        <p class="text-dim">Personaliza la experiencia para tu grupo.</p>
      </div>

      <div class="modern-card game-creation-card">
        <div class="setup-section">
          <h3>Ajustes Relámpago</h3>
          <p class="text-dim">Elegí una configuración ya armada.</p>
          <div class="mode-presets">
            <button 
              *ngFor="let preset of gameModePresets" 
              (click)="applyPreset(preset.mode)" 
              [class.active]="selectedMode() === preset.mode"
              class="preset-button">
              <div class="preset-icon-box">
                <ng-container [ngSwitch]="preset.mode">
                  <svg *ngSwitchCase="'PREVIA'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="5"/></svg>
                  <svg *ngSwitchCase="'NORMAL'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8Z"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 15c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5"/></svg>
                  <svg *ngSwitchCase="'TRANQUI'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="5"/><line x1="10" x2="10" y1="2" y2="5"/><line x1="14" x2="14" y1="2" y2="5"/></svg>
                  <svg *ngSwitchCase="'EXTREMO'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 2-2V8a6 6 0 1 0-12 0v10a2 2 0 0 0 2 2h8z"/></svg>
                </ng-container>
              </div>
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Opciones de Personalización -->
        <div class="custom-settings">
          <div class="setting-group">
            <div class="label-row">
              <label class="setting-label">Nivel de Manija</label>
              <span class="value-badge">{{ customSettings().chaos_level }} / 10</span>
            </div>
            <input type="range" min="1" max="10" [(ngModel)]="customSettings().chaos_level" (ngModelChange)="updateCustomMode()" class="slider">
          </div>

          <div class="setting-group">
            <label class="setting-label">Categorías de Retos</label>
            <div class="category-grid">
              <div *ngFor="let cat of allCategories" class="category-item" [class.checked]="categorySelection[cat]">
                <input type="checkbox" [id]="cat" [value]="cat" [(ngModel)]="categorySelection[cat]" (ngModelChange)="updateCustomMode()">
                <label [for]="cat">{{ cat }}</label>
              </div>
            </div>
          </div>

          <div class="setting-group toggle-group card">
            <div class="toggle-info">
              <label class="setting-label">Desafíos Prócer</label>
              <p class="text-dim">Habilitá retos picantes que solo un verdadero argentino aguantaría.</p>
            </div>
            <label class="switch">
              <input type="checkbox" [(ngModel)]="customSettings().legendary_enabled" (ngModelChange)="updateCustomMode()">
              <span class="slider-round"></span>
            </label>
          </div>
        </div>

        <button (click)="createGame()" class="modern-button main-action-button" [disabled]="loading()">
          <span class="btn-content" *ngIf="!loading()">
            MANDALE MECHA
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>
          </span>
          <span class="btn-content" *ngIf="loading()">
            ARMANDO LA PREVIA...
          </span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 100px;
    }

    .setup-header {
      margin-bottom: 40px;
      text-align: center;
    }
    .back-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.8rem;
      margin-bottom: 20px;
      transition: all 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .setup-header h1 { font-size: 2.5rem; font-weight: 950; letter-spacing: -1px; margin-bottom: 5px; }
    .setup-header h1 span { color: var(--accent-primary); }

    .setup-section { margin-bottom: 30px; }
    .setup-section h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 5px; }

    .game-creation-card {
      padding: 40px;
    }

    .mode-presets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .preset-button {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 15px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .preset-icon-box {
      width: 24px;
      height: 24px;
      opacity: 0.6;
    }
    .preset-button.active .preset-icon-box { opacity: 1; }
    .preset-icon-box svg { width: 100%; height: 100%; }
    .preset-button:hover {
      border-color: rgba(255,255,255,0.3);
      transform: translateY(-3px);
    }
    .preset-button.active {
      background: var(--accent-primary);
      color: #000;
      border-color: var(--accent-primary);
      box-shadow: 0 10px 20px rgba(var(--accent-primary-rgb), 0.2);
    }

    .custom-settings {
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 35px;
    }

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .label-row { display: flex; justify-content: space-between; align-items: center; }
    .setting-label { font-size: 1rem; font-weight: 800; color: #fff; }
    .value-badge { background: var(--accent-primary); color: #000; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 0.8rem; }

    .slider {
      width: 100%;
      -webkit-appearance: none;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 5px;
      outline: none;
    }
    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px; height: 24px;
      background: var(--accent-primary);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(var(--accent-primary-rgb), 0.5);
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .category-item {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.02);
      padding: 12px 15px; border-radius: 12px;
      border: 1px solid var(--border-color);
      cursor: pointer; transition: all 0.2s;
    }
    .category-item:hover { background: rgba(255,255,255,0.05); }
    .category-item.checked { border-color: var(--accent-primary); background: rgba(var(--accent-primary-rgb), 0.05); }
    
    .category-item input { display: none; }
    .category-item label { font-size: 0.85rem; font-weight: 700; cursor: pointer; flex: 1; }

    .toggle-group {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
    }
    .toggle-info { flex: 1; padding-right: 20px; }
    .toggle-info p { font-size: 0.8rem; margin-top: 4px; }

    /* SWITCH STYLES */
    .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider-round {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 34px;
    }
    .slider-round:before {
      position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider-round { background-color: var(--accent-primary); }
    input:checked + .slider-round:before { transform: translateX(22px); background-color: #000; }

    .main-action-button {
      margin-top: 50px;
      width: 100%;
      height: 65px;
      font-size: 1.2rem;
      border-radius: 20px;
    }
    .btn-content { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .btn-icon { width: 28px; height: 28px; }

    @media (max-width: 768px) {
      .game-creation-card { padding: 25px; }
      .setup-header h1 { font-size: 2rem; }
    }


    @media (max-width: 768px) {
      .share-actions {
        flex-direction: column;
      }

      .qr-card {
        padding: 30px 20px;
      }

      .code-value {
        font-size: 1.8rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  loading = signal(false);

  selectedMode = signal<GameMode>('NORMAL');
  customSettings = signal<GameSettings>({
    chaos_level: 5,
    legendary_enabled: true,
    categories: ['SOCIAL', 'ALCOHOL', 'CAOS', 'GRUPO']
  });

  allCategories: ChallengeCategory[] = ['SOCIAL', 'VERGONZOSO', 'FISICO', 'MENTAL', 'ALCOHOL', 'GRUPO', 'CAOS', 'EXTREMO'];
  categorySelection: { [key: string]: boolean } = {};

  gameModePresets: { mode: GameMode, label: string }[] = [
    { mode: 'PREVIA', label: 'PREVIA' },
    { mode: 'NORMAL', label: 'FIESTA' },
    { mode: 'TRANQUI', label: 'TRANQUI' },
    { mode: 'EXTREMO', label: 'EXTREMO' },
  ];

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {
    this.allCategories.forEach(cat => this.categorySelection[cat] = false);
    this.applyPreset('NORMAL'); // Default preset
  }

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      const { data } = await this.gameService.supabase.from('users').select('*').eq('id', user.id).single();
      if (data) this.profile.set(data as UserProfile);
    }
  }

  applyPreset(mode: GameMode) {
    this.selectedMode.set(mode);
    switch (mode) {
      case 'PREVIA':
        this.customSettings.set({
          chaos_level: 4,
          legendary_enabled: false,
          categories: ['SOCIAL', 'MENTAL', 'ALCOHOL', 'GRUPO']
        });
        break;
      case 'NORMAL':
        this.customSettings.set({
          chaos_level: 6,
          legendary_enabled: true,
          categories: ['SOCIAL', 'VERGONZOSO', 'FISICO', 'MENTAL', 'ALCOHOL', 'GRUPO', 'CAOS']
        });
        break;
      case 'TRANQUI':
        this.customSettings.set({
          chaos_level: 3,
          legendary_enabled: false,
          categories: ['SOCIAL', 'MENTAL', 'GRUPO']
        });
        break;
      case 'EXTREMO':
        this.customSettings.set({
          chaos_level: 10,
          legendary_enabled: true,
          categories: ['SOCIAL', 'VERGONZOSO', 'FISICO', 'MENTAL', 'ALCOHOL', 'GRUPO', 'CAOS', 'EXTREMO']
        });
        break;
      default:
        break;
    }
    this.updateCategorySelection();
  }

  updateCustomMode() {
    this.selectedMode.set('CUSTOM');
    this.customSettings.update(settings => ({
      ...settings,
      categories: this.allCategories.filter(cat => this.categorySelection[cat])
    }));
  }

  updateCategorySelection() {
    this.allCategories.forEach(cat => {
      this.categorySelection[cat] = this.customSettings().categories.includes(cat);
    });
  }

  async createGame() {
    this.loading.set(true);
    try {
      const newGame = await this.gameService.createGame(this.selectedMode(), {
        ...this.customSettings(),
        game_type: 'ROULETTE'
      });
      // Navegar al lobby donde se mostrará el QR
      this.router.navigate(['/game/lobby', newGame.id]);
    } catch (error) {
      alert('Error al crear sala.');
      console.error('Error creating game:', error);
    } finally {
      this.loading.set(false);
    }
  }

}
