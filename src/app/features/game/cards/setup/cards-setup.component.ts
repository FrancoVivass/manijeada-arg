import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '../../../../core/services/game.service';
import { GameMode, GameSettings } from '../../../../core/models/game.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cards-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in setup-container">
      <div class="setup-header">
        <button routerLink="/dashboard" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver al Hub
        </button>
        <h1>Duelo de <span>Cartas</span></h1>
        <p class="text-dim">Elegí tu juego de cartas favorito para la previa.</p>
      </div>

      <div class="cards-grid">
        <!-- MAYOR O MENOR -->
        <div class="game-option-card" [class.selected]="selectedGame() === 'MAYOR_MENOR'" (click)="selectGame('MAYOR_MENOR')">
          <div class="option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 9-7 9 7"/><path d="m3 8 9-7 9 7"/><path d="m3 24 9-7 9 7"/></svg>
          </div>
          <div class="option-info">
            <h3>Mayor o Menor</h3>
            <p>Adiviná si la carta que sigue es más alta o más baja. ¡Si errás, tomás!</p>
          </div>
          <div class="selection-check">
            <svg *ngIf="selectedGame() === 'MAYOR_MENOR'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <!-- ROJO O NEGRO -->
        <div class="game-option-card" [class.selected]="selectedGame() === 'ROJO_NEGRO'" (click)="selectGame('ROJO_NEGRO')">
          <div class="option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div class="option-info">
            <h3>Rojo o Negro</h3>
            <p>Palo o color. Un juego rápido de puro azar y shots rápidos.</p>
          </div>
          <div class="selection-check">
            <svg *ngIf="selectedGame() === 'ROJO_NEGRO'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <!-- LA PIRÁMIDE -->
        <div class="game-option-card" [class.selected]="selectedGame() === 'PIRAMIDE'" (click)="selectGame('PIRAMIDE')">
          <div class="option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 22h20L12 2Z"/><path d="M12 2v20"/><path d="M2 22l10-10 10 10"/></svg>
          </div>
          <div class="option-info">
            <h3>La Pirámide</h3>
            <p>El clásico. Armá la pirámide, recibí tus cartas y subí niveles. Entre más arriba, más tomás.</p>
          </div>
          <div class="selection-check">
            <svg *ngIf="selectedGame() === 'PIRAMIDE'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <!-- CONFIGURACIÓN PIRÁMIDE (Sólo si está seleccionada) -->
        <div class="pyramid-config-box fade-in" *ngIf="selectedGame() === 'PIRAMIDE'">
          <div class="config-row">
            <label>Tamaño de la Pirámide (Filas)</label>
            <div class="number-stepper">
              <button (click)="adjustRows(-1)">-</button>
              <span>{{ pyramidRows() }}</span>
              <button (click)="adjustRows(1)">+</button>
            </div>
          </div>
          <div class="config-row">
            <label>Tragos Iniciales (Base)</label>
            <div class="number-stepper">
              <button (click)="adjustShots(-1)">-</button>
              <span>{{ initialShots() }}</span>
              <button (click)="adjustShots(1)">+</button>
            </div>
          </div>
          <p class="config-hint">Cada fila multiplica x2 los tragos. La cima (5 cartas) es FONDO BLANCO. Nivel impar = TOMAR, par = DAR.</p>
        </div>

        <!-- SIETE LOCO -->
        <div class="game-option-card" [class.selected]="selectedGame() === 'SIETE_LOCO'" (click)="selectGame('SIETE_LOCO')">
          <div class="option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div class="option-info">
            <h3>Siete Loco</h3>
            <p>Reglas especiales para cada número. El 7 es el que manda.</p>
          </div>
          <div class="selection-check">
            <svg *ngIf="selectedGame() === 'SIETE_LOCO'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>

      <div class="action-bar fade-in" *ngIf="selectedGame()">
        <button (click)="createCardGame()" class="modern-button main-action-button" [disabled]="loading()">
          <span class="btn-content" *ngIf="!loading()">
            REPARTIR CARTAS
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 7h6"/><path d="M9 12h6"/><path d="M9 17h6"/></svg>
          </span>
          <span class="btn-content" *ngIf="loading()">
            BARAJANDO...
          </span>
        </button>

      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      max-width: 900px;
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
      padding: 10px 20px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 25px;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .setup-header h1 { font-size: 3rem; font-weight: 950; letter-spacing: -1.5px; margin-bottom: 10px; }
    .setup-header h1 span { color: var(--accent-primary); }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .game-option-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-color);
      padding: 25px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
    }

    .game-option-card:hover:not(.disabled) {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.2);
      transform: translateY(-5px);
    }

    .game-option-card.selected {
      border-color: var(--accent-primary);
      background: rgba(var(--accent-primary-rgb), 0.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .option-icon {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.05);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .option-icon svg { width: 30px; height: 30px; color: var(--accent-primary); }

    .option-info h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: 5px; }
    .option-info p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4; }

    .selection-check {
      margin-left: auto;
      width: 24px;
      height: 24px;
      color: var(--accent-primary);
    }

    .pyramid-config-box {
      grid-column: 1 / -1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      padding: 25px;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .config-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .number-stepper {
      display: flex;
      align-items: center;
      gap: 15px;
      background: #000;
      padding: 5px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .number-stepper button {
      width: 35px;
      height: 35px;
      border-radius: 8px;
      border: none;
      background: var(--accent-primary);
      color: #000;
      font-weight: 900;
      cursor: pointer;
    }
    .number-stepper span { font-weight: 800; font-size: 1.2rem; min-width: 30px; text-align: center; }
    .config-hint { font-size: 0.8rem; color: var(--accent-secondary); font-style: italic; }

    .disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .upcoming-tag {
      position: absolute;
      top: 15px;
      right: -25px;
      background: var(--accent-secondary);
      color: #000;
      font-size: 0.6rem;
      font-weight: 900;
      padding: 4px 30px;
      transform: rotate(45deg);
    }

    .action-bar {
      margin-top: 50px;
      display: flex;
      justify-content: center;
    }

    .main-action-button {
      width: 100%;
      max-width: 400px;
      height: 70px;
      font-size: 1.3rem;
      font-weight: 950;
      border-radius: 20px;
      background: var(--accent-primary);
      color: #000;
      box-shadow: 0 15px 30px rgba(var(--accent-primary-rgb), 0.2);
    }

    .btn-content { display: flex; align-items: center; justify-content: center; gap: 15px; }
    .btn-icon { width: 24px; height: 24px; }

    @media (max-width: 768px) {
      .cards-grid { grid-template-columns: 1fr; }
      .setup-header h1 { font-size: 2.2rem; }
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
  `],
})
export class CardsSetupComponent {
  selectedGame = signal<GameMode | null>(null);
  loading = signal(false);
  
  // Pyramid Config
  pyramidRows = signal(5);
  initialShots = signal(1);

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  selectGame(mode: GameMode) {
    this.selectedGame.set(mode);
  }

  adjustRows(delta: number) {
    const val = this.pyramidRows() + delta;
    if (val >= 3 && val <= 7) this.pyramidRows.set(val);
  }

  adjustShots(delta: number) {
    const val = this.initialShots() + delta;
    if (val >= 1 && val <= 5) this.initialShots.set(val);
  }

  async createCardGame() {
    if (!this.selectedGame()) return;
    this.loading.set(true);
    
    try {
      const settings: GameSettings = {
        chaos_level: 5,
        legendary_enabled: true,
        categories: ['ALCOHOL', 'SOCIAL'],
        pyramid_size: this.pyramidRows(),
        starting_shots: this.initialShots()
      } as any;
      
      const newGame = await this.gameService.createGame(this.selectedGame()!, {
        ...settings,
        game_type: 'CARDS'
      });
      // Navegar al lobby donde se mostrará el QR
      this.router.navigate(['/game/lobby', newGame.id]);
    } catch (error) {
      alert('Error al crear sala de cartas.');
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

}

