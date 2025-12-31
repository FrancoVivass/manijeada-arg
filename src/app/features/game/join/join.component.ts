import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GameService } from '../../../core/services/game.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in join-container">
      <div class="modern-card status-card">
        <div class="spinner"></div>
        <h2>Uniendo a la partida</h2>
        <div class="code-badge">{{ joinCode }}</div>
        <p class="text-dim">Preparando el caos, un momento...</p>
      </div>
    </div>
  `,
  styles: [`
    .join-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 250px);
    }
    .status-card {
      text-align: center;
      width: 100%;
      max-width: 350px;
      padding: 50px 30px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      margin: 0 auto 30px;
      animation: spin 1s linear infinite;
    }
    .code-badge {
      display: inline-block;
      margin: 20px 0;
      padding: 8px 24px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      font-weight: 800;
      letter-spacing: 4px;
      font-size: 1.2rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class JoinComponent implements OnInit {
  joinCode: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private gameService: GameService
  ) {}

  async ngOnInit() {
    const rawCode = this.route.snapshot.paramMap.get('code');
    this.joinCode = rawCode ? rawCode.toUpperCase() : null;
    
    if (!this.joinCode) {
      this.router.navigate(['/']);
      return;
    }

    if (!this.authService.isAuthenticated && !this.authService.isGuest()) {
      sessionStorage.setItem('pendingJoinCode', this.joinCode);
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const game = await this.gameService.getGameByCode(this.joinCode);

      if (!game) {
        alert('Código de sala no válido');
        this.router.navigate(['/']);
        return;
      }

      const user = this.authService.currentUser();
      const isGuest = this.authService.isGuest();
      let displayName = '';

      if (user && !isGuest) {
        displayName = user.user_metadata['display_name'] || user.email?.split('@')[0] || 'Jugador';
        await this.gameService.addPlayerToGame(game.id, user.id, displayName);
      } else if (isGuest) {
        // For guests, generate a unique display name
        displayName = `Invitado ${Math.floor(Math.random() * 1000)}`;
        await this.gameService.addPlayerToGame(game.id, null, displayName);
      }

      this.router.navigate(['/game/lobby', game.id]);
    } catch (e) {
      console.error(e);
      this.router.navigate(['/']);
    }
  }
}
