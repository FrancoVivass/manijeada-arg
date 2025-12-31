import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GameService } from '../../../core/services/game.service';
import { UserProfile } from '../../../core/models/game.models';

@Component({
  selector: 'app-select-game',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="select-game-container fade-in">
      <!-- Welcome Header -->
      <header class="welcome-header">
        <div class="user-info">
          <h1>¡Hola, <span>{{ profile()?.display_name || 'Manijero' }}</span>!</h1>
          <p>¿Qué vamos a jugar hoy?</p>
        </div>
        <div class="user-stats card">
          <div class="stat">
            <span class="val">{{ profile()?.total_shots || 0 }}</span>
            <span class="lab">Shots</span>
          </div>
          <div class="stat">
            <span class="val">0</span>
            <span class="lab">Logros</span>
          </div>
        </div>
      </header>

      <!-- Games Grid -->
      <div class="games-grid">
        <!-- RULETA -->
        <div class="game-card roulette-card" (click)="goToRoulette()">
          <div class="card-bg-relleno">
            <video autoplay loop muted playsinline>
              <source src="assets/animations/relleno/Dragon.webm" type="video/webm">
            </video>
          </div>
          <div class="card-content">
            <span class="game-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/><path d="m4.93 4.93 14.14 14.14"/></svg>
            </span>
            <h2>Ruleta del Caos</h2>
            <p>Retos, shots y pura manija en tiempo real.</p>
            <div class="card-footer">
              <span class="status-online">SALA ACTIVA</span>
              <button class="select-btn">JUGAR AHORA</button>
            </div>
          </div>
        </div>

        <!-- CARTAS -->
        <div class="game-card cards-card" (click)="goToCards()">
          <div class="card-bg-relleno">
            <video autoplay loop muted playsinline>
              <source src="assets/animations/relleno/laughing cat.webm" type="video/webm">
            </video>
          </div>
          <div class="card-content">
            <span class="game-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 7h6"/><path d="M9 12h6"/><path d="M9 17h6"/></svg>
            </span>
            <h2>Duelo de Cartas</h2>
            <p>Estrategia, azar y traición con mazos argentinos.</p>
            <div class="card-footer">
              <span class="status-online">NUEVO JUEGO</span>
              <button class="select-btn">ELEGIR MODO</button>
            </div>
          </div>
        </div>

        <!-- IMPOSTOR -->
        <div class="game-card impostor-card" (click)="goToImpostor()">
          <div class="card-bg-relleno">
            <video autoplay loop muted playsinline>
              <source src="assets/animations/relleno/black rainbow cat.webm" type="video/webm">
            </video>
          </div>
          <div class="card-content">
            <span class="game-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M1 12h6M17 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>
            </span>
            <h2>El Impostor</h2>
            <p>Descubre quién miente. ¿Sos vos el impostor?</p>
            <div class="card-footer">
              <span class="status-online">MENTIRAS</span>
              <button class="select-btn">JUGAR AHORA</button>
            </div>
          </div>
        </div>

        <!-- BOMBA -->
        <div class="game-card upcoming-card">
          <div class="card-bg-relleno">
            <video autoplay loop muted playsinline>
              <source src="assets/animations/relleno/A simple drunk beer bottle.webm" type="video/webm">
            </video>
          </div>
          <div class="card-content">
            <span class="game-badge">PRÓXIMAMENTE</span>
            <span class="game-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="9"/><path d="M18.35 5.65 19 5"/><path d="m21 3 1-1"/><path d="m19 2 1 1"/><path d="M22 1l-1 1"/><path d="M15 2h2"/></svg>
            </span>
            <h2>La Bomba</h2>
            <p>Rapidez mental. No dejes que explote en tus manos.</p>
          </div>
        </div>
      </div>

      <!-- Join by Code Section -->
      <section class="join-section card">
        <div class="join-content">
          <h3>¿Tenés un código?</h3>
          <p>Unite a la partida de tus amigos.</p>
        </div>
        <div class="join-input-group">
          <input #joinCode type="text" placeholder="CÓDIGO" maxlength="6">
          <button (click)="joinByCode(joinCode.value)" [disabled]="!joinCode.value">UNIRSE</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .select-game-container {
      max-width: 1100px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 50px;
      gap: 20px;
    }
    .user-info h1 { font-size: 2.5rem; font-weight: 950; letter-spacing: -1px; }
    .user-info h1 span { color: var(--accent-primary); }
    .user-info p { color: var(--text-secondary); font-size: 1.1rem; }

    .user-stats {
      display: flex;
      gap: 30px;
      padding: 15px 30px;
    }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat .val { font-size: 1.5rem; font-weight: 900; color: #fff; }
    .stat .lab { font-size: 0.7rem; text-transform: uppercase; color: var(--accent-primary); font-weight: 800; }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 60px;
    }

    .game-card {
      height: 450px;
      border-radius: 30px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .game-card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--accent-primary);
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }

    .card-bg-relleno {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 250px; /* Tamaño más chico para evitar pixelado */
      height: 250px;
      z-index: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-bg-relleno video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0.2;
      transition: all 0.4s;
      filter: blur(2px); /* Un leve desenfoque ayuda a disimular la baja resolución */
    }
    .game-card:hover .card-bg-relleno video {
      opacity: 0.5;
      transform: scale(1.1);
      filter: blur(0);
    }

    .card-content {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 40px;
      display: flex;
      flex-direction: column;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
    }

    .game-icon { width: 64px; height: 64px; margin-bottom: 20px; display: block; opacity: 0.8; }
    .game-icon svg { width: 100%; height: 100%; color: var(--accent-primary); }
    .game-card h2 { font-size: 2.2rem; font-weight: 900; margin-bottom: 10px; color: #fff; }
    .game-card p { color: rgba(255,255,255,0.7); font-size: 1rem; line-height: 1.4; }

    .card-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .status-online {
      font-size: 0.7rem; font-weight: 900; color: var(--success);
      display: flex; align-items: center; gap: 6px;
    }
    .status-online::before {
      content: ''; width: 8px; height: 8px; background: var(--success);
      border-radius: 50%; display: block; box-shadow: 0 0 10px var(--success);
    }

    .select-btn {
      background: #fff; color: #000; border: none;
      padding: 12px 20px; border-radius: 12px;
      font-weight: 900; font-size: 0.8rem;
      cursor: pointer;
    }

    .upcoming-card {
      cursor: default;
      filter: grayscale(0.5);
      opacity: 0.8;
    }
    .upcoming-card:hover { transform: none; border-color: rgba(255,255,255,0.1); }
    .game-badge {
      position: absolute; top: 20px; right: 20px;
      background: var(--accent-secondary); color: #000;
      padding: 5px 12px; border-radius: 8px; font-weight: 900; font-size: 0.7rem;
    }

    .join-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30px 50px;
      background: rgba(var(--accent-primary-rgb), 0.05);
      border-color: rgba(var(--accent-primary-rgb), 0.2);
    }
    .join-content h3 { font-size: 1.5rem; font-weight: 900; margin-bottom: 5px; }
    .join-content p { color: var(--text-secondary); }

    .join-input-group {
      display: flex;
      gap: 15px;
    }
    .join-input-group input {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 15px 25px;
      color: #fff;
      font-weight: 900;
      font-size: 1.2rem;
      width: 180px;
      text-align: center;
      letter-spacing: 4px;
    }
    .join-input-group button {
      background: var(--accent-primary);
      color: #000;
      border: none;
      padding: 0 30px;
      border-radius: 12px;
      font-weight: 950;
      cursor: pointer;
      transition: all 0.2s;
    }
    .join-input-group button:hover:not(:disabled) { transform: scale(1.05); }
    .join-input-group button:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 768px) {
      .welcome-header { flex-direction: column; align-items: flex-start; }
      .user-stats { width: 100%; justify-content: center; }
      .join-section { flex-direction: column; gap: 25px; text-align: center; }
      .join-input-group { width: 100%; }
      .join-input-group input { flex: 1; }
    }
  `]
})
export class SelectGameComponent implements OnInit {
  profile = signal<UserProfile | null>(null);

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      const { data } = await this.gameService.supabase.from('users').select('*').eq('id', user.id).single();
      if (data) this.profile.set(data as UserProfile);
    }
  }

  goToRoulette() {
    this.router.navigate(['/game/roulette/setup']);
  }

  goToCards() {
    this.router.navigate(['/game/cards/setup']);
  }

  goToImpostor() {
    this.router.navigate(['/game/impostor/setup']);
  }

  joinByCode(code: string) {
    if (!code) return;
    this.router.navigate(['/game/join', code.toUpperCase()]);
  }
}

