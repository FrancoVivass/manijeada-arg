import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ProfileSettingsComponent } from './shared/components/profile-settings/profile-settings.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ProfileSettingsComponent, RouterModule],
  template: `
    <div class="app-background">
      <video autoplay loop muted playsinline class="bg-video">
        <source src="assets/animations/relleno/black rainbow cat.webm" type="video/webm">
      </video>
    </div>

    <div class="app-container" *ngIf="authService.isInitialized(); else loading">
      <header class="main-header" *ngIf="!isAuthPage()">
        <div class="header-content">
          <div class="logo" (click)="goHome()">
            <span>MANI</span>JEADA
          </div>
          
          <nav class="header-nav">
            <div class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </span>
              <span class="nav-label">Hub</span>
            </div>
            <div class="nav-item" routerLink="/game/roulette/setup" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/><path d="m4.93 4.93 14.14 14.14"/></svg>
              </span>
              <span class="nav-label">Ruleta</span>
            </div>
                <div class="nav-item" routerLink="/game/cards/setup" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 7h6"/><path d="M9 12h6"/><path d="M9 17h6"/></svg>
                  </span>
                  <span class="nav-label">Cartas</span>
                </div>
                <div class="nav-item" routerLink="/game/impostor/setup" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M1 12h6M17 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>
                  </span>
                  <span class="nav-label">Impostor</span>
                </div>
                <div class="nav-item upcoming">
                  <span class="nav-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/><rect width="12" height="12" x="10" y="9" rx="2"/><path d="M14 13h4"/><path d="M16 11v4"/></svg>
                  </span>
                  <span class="nav-label">Mímica</span>
                  <span class="upcoming-badge">PRÓX.</span>
                </div>
          </nav>

          <div class="user-pill" *ngIf="authService.currentUser()" (click)="showProfile.set(true)">
            <span class="online-dot"></span>
            {{ authService.currentUser()?.user_metadata?.['display_name'] || 'Cargando...' }}
          </div>
        </div>
      </header>

      <main class="fade-in" [class.no-padding]="isAuthPage()">
        <router-outlet></router-outlet>
      </main>

      <app-profile-settings 
        *ngIf="showProfile()" 
        (close)="showProfile.set(false)">
      </app-profile-settings>

      <footer class="main-footer" *ngIf="!isAuthPage()">
        <div class="footer-logo-bg">
          <img src="assets/animations/mapache.png" alt="Mapache Background">
        </div>
        
        <div class="footer-grid">
          <!-- Columna 1: Brand & Desc -->
          <div class="footer-col brand-col">
            <div class="footer-logo-box">
              <span class="brand"><span>MANI</span>JEADA</span>
            </div>
            <p class="brand-desc">Elevando el nivel de tus previas con la tecnología del caos. La app número uno para antes de salir.</p>
            <div class="status-pill">
              <span class="dot"></span> 
              <span>Servidores Online</span>
            </div>
          </div>

          <div class="footer-col">
            <h4>JUEGOS</h4>
            <ul class="footer-links">
              <li routerLink="/game/roulette/setup" style="cursor: pointer;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/><path d="m4.93 4.93 14.14 14.14"/></svg>
                Ruleta del Caos
              </li>
                  <li routerLink="/game/cards/setup" style="cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 7h6"/><path d="M9 12h6"/><path d="M9 17h6"/></svg>
                    Duelo de Cartas
                  </li>
                  <li routerLink="/game/impostor/setup" style="cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M1 12h6M17 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>
                    El Impostor
                  </li>
                  <li class="upcoming-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M18 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/><rect width="12" height="12" x="10" y="9" rx="2"/><path d="M14 13h4"/><path d="M16 11v4"/></svg>
                    Mímica (Pronto)
                  </li>
              <li class="upcoming-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><circle cx="11" cy="13" r="9"/><path d="M18.35 5.65 19 5"/><path d="m21 3 1-1"/><path d="m19 2 1 1"/><path d="M22 1l-1 1"/><path d="M15 2h2"/></svg>
                Bomba (Pronto)
              </li>
            </ul>
          </div>

          <!-- Columna 3: Información -->
          <div class="footer-col">
            <h4>INFORMACIÓN</h4>
            <ul class="footer-links">
              <li><a routerLink="/info/how-to-play">Cómo Jugar</a></li>
              <li><a routerLink="/info/privacy">Privacidad</a></li>
              <li><a routerLink="/info/terms">Términos</a></li>
              <li><a routerLink="/info/support">Soporte</a></li>
            </ul>
          </div>

          <!-- Columna 4: Social & Dev -->
          <div class="footer-col social-col">
            <h4>REDES SOCIALES</h4>
            <div class="social-grid-modern">
              <a href="https://www.instagram.com/manijeada/" target="_blank" rel="noopener noreferrer" class="social-link-white" aria-label="Instagram ManiJeada">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.774 4.919 4.851.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.075-1.667 4.703-4.919 4.85-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.775-4.919-4.851-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.075 1.666-4.703 4.919-4.85 1.265-.057 1.644-.069 4.848-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@francovivasa" target="_blank" rel="noopener noreferrer" class="social-link-white" aria-label="TikTok Franco Vivas">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.1-.01-.1-.01-.5-.03-1.01.02-1.51.3-2.4 1.47-4.72 3.54-5.9 1.27-.74 2.74-1.02 4.19-1.01v4.26c-.65-.17-1.37-.28-2.03-.12-.81.12-1.5.53-1.96 1.13-.52.71-.7 1.67-.44 2.52.1.28.28.53.46.77.49.56 1.24.93 2.01.91.85-.02 1.6-.46 1.97-1.15.13-.22.2-.47.23-.73.05-1.51.04-3.01.03-4.52 0-3.9-.01-7.81.02-11.72z"/></svg>
              </a>
              <a href="https://www.instagram.com/fran.vivas_ok/" target="_blank" rel="noopener noreferrer" class="social-link-white" aria-label="Instagram Franco Vivas">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.774 4.919 4.851.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.075-1.667 4.703-4.919 4.85-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.775-4.919-4.851-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.075 1.666-4.703 4.919-4.85 1.265-.057 1.644-.069 4.848-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
            <div class="footer-dev-info">
              <span>Desarrollado por</span>
              <a href="https://vivasfranco.dev" target="_blank">Franco Vivas</a>
            </div>
            <p class="legals">+18 | BEBE CON RESPONSABILIDAD</p>
          </div>
        </div>
        
        <div class="footer-bottom-bar">
          <div class="footer-bottom-content">
            <p>&copy; 2025 Manijeada. Todos los derechos reservados.</p>
            <div class="footer-badges">
              <span class="badge">
                <svg viewBox="0 0 24 24" class="badge-icon-svg"><rect width="24" height="16" y="4" fill="#75AADB" rx="2"/><rect width="24" height="5.33" y="9.33" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#F6B40E"/></svg>
                ARGENTINA
              </span>
              <span class="badge">V1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <ng-template #loading>
      <div class="loading-screen">
        <div class="video-loader-container">
          <video autoplay loop muted playsinline class="loader-video">
            <source src="assets/animations/monster.webm" type="video/webm">
          </video>
        </div>
        <p class="loading-text">Iniciando Manijeada...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .app-background {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: -1; opacity: 0.08;
      pointer-events: none;
    }
    .bg-video { width: 100%; height: 100%; object-fit: cover; }

    .app-container {
      display: flex; flex-direction: column;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .main-header {
      padding: 15px 24px;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(15px);
      border-bottom: 1px solid var(--border-color);
      position: sticky; top: 0; z-index: 1000;
    }
    .header-content {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
    }
    .logo { font-weight: 900; letter-spacing: 2px; cursor: pointer; font-size: 1.2rem; }
    .logo span { opacity: 0.6; font-weight: 300; }

    .header-nav { display: flex; gap: 25px; margin: 0 20px; }
    .nav-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; opacity: 0.5; position: relative; transition: opacity 0.3s; }
    .nav-item:hover { opacity: 0.8; }
    .nav-item.active { opacity: 1; }
    .nav-icon { font-size: 1.3rem; margin-bottom: 2px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    .nav-icon svg { width: 100%; height: 100%; }
    .nav-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .upcoming-badge { position: absolute; top: -5px; right: -12px; background: var(--accent-primary); color: #000; font-size: 0.45rem; padding: 1px 5px; border-radius: 4px; font-weight: 900; }

    .user-pill {
      background: rgba(255,255,255,0.05); padding: 8px 18px; border-radius: 30px;
      font-size: 0.85rem; border: 1px solid var(--border-color);
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      transition: all 0.2s;
    }
    .user-pill:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
    .online-dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); }

    main { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; padding: 40px 20px; }
    main.no-padding { padding: 0; max-width: none; }

    .main-footer {
      background: #050505; border-top: 1px solid var(--border-color);
      padding: 50px 24px 30px;
      position: relative; overflow: hidden;
      margin-top: 250px; /* Espacio adicional antes del footer */
    }
    .footer-logo-bg {
      position: absolute;
      top: 20px; left: 50%;
      transform: translateX(-50%);
      width: 100%; height: calc(100% - 40px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0.06;
      pointer-events: none; z-index: 0;
    }
    .footer-logo-bg img {
      width: 400px;
      height: 400px;
      object-fit: contain;
      filter: grayscale(0.7) brightness(1.1); /* Sutil color y más brillo */
    }

    .footer-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 60px;
      position: relative; z-index: 1;
      padding-bottom: 80px;
    }
    .footer-logo-box { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
    .brand { font-weight: 900; letter-spacing: 3px; font-size: 1.8rem; color: #fff; }
    .brand span { opacity: 0.6; font-weight: 300; }
    .brand-desc { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 25px; max-width: 350px; }
    
    .status-pill {
      display: inline-flex; align-items: center; gap: 10px;
      background: rgba(0, 255, 128, 0.05); padding: 8px 16px; border-radius: 20px;
      font-size: 0.75rem; color: var(--success); border: 1px solid rgba(0, 255, 128, 0.1);
      font-weight: 700;
    }
    .status-pill .dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); animation: pulse 2s infinite; }

    .footer-col h4 { font-size: 0.85rem; font-weight: 900; color: var(--accent-primary); margin-bottom: 25px; letter-spacing: 2px; text-transform: uppercase; }
    .footer-links { list-style: none; padding: 0; }
    .footer-links li { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 15px; transition: transform 0.2s; display: flex; align-items: center; gap: 10px; }
    .footer-icon { width: 18px; height: 18px; opacity: 0.6; }
    .footer-links li:hover { transform: translateX(5px); color: #fff; }
    .footer-links a { color: inherit; text-decoration: none; }
    .active-link { color: #fff !important; font-weight: 700; }
    .upcoming-link { opacity: 0.35; font-size: 0.8rem; }

    .social-grid-modern { display: flex; gap: 15px; margin-bottom: 35px; }
    .social-link-white {
      width: 48px; height: 48px; border-radius: 14px;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .social-link-white svg { fill: #fff; width: 22px; height: 22px; transition: all 0.3s; }
    .social-link-white:hover { background: #fff; transform: translateY(-8px); border-color: #fff; box-shadow: 0 10px 20px rgba(255,255,255,0.1); }
    .social-link-white:hover svg { fill: #000; transform: scale(1.1); }

    .footer-dev-info { margin-bottom: 20px; }
    .footer-dev-info span { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 5px; }
    .footer-dev-info a { color: #fff; font-weight: 800; font-size: 1.2rem; text-decoration: none; border-bottom: 2px solid var(--accent-primary); }

    .legals { font-size: 0.7rem; color: var(--danger); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-top: 20px; }

    .footer-bottom-bar {
      background: rgba(0,0,0,0.5); border-top: 1px solid rgba(255,255,255,0.05);
      padding: 30px 24px; position: relative; z-index: 1;
    }
    .footer-bottom-content {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .footer-badges { display: flex; gap: 15px; }
    .badge { background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #fff; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 8px; }
    .badge-icon-svg { width: 16px; height: 16px; }

    .loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0a0a0a; }
    .video-loader-container { width: 100px; height: 100px; filter: drop-shadow(0 0 15px rgba(255,255,255,0.1)); }
    .loader-video { width: 100%; height: 100%; object-fit: contain; }
    .loading-text { color: #fff; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; font-size: 0.8rem; margin-top: 20px; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

    @media (max-width: 1024px) {
      .footer-grid { grid-template-columns: 1.5fr 1fr 1fr; }
      .social-col { grid-column: span 3; border-top: 1px solid var(--border-color); padding-top: 40px; }
    }

    @media (max-width: 768px) {
      .header-nav { display: none; }
      .footer-grid { grid-template-columns: 1fr; text-align: center; gap: 50px; padding-bottom: 50px; }
      .brand-desc { margin: 0 auto 25px; }
      .footer-logo-box { justify-content: center; }
      .status-pill { margin: 0 auto; }
      .social-grid-modern { justify-content: center; }
      .footer-bottom-content { flex-direction: column; gap: 20px; text-align: center; }
      .social-col { grid-column: auto; }
    }
  `]
})
export class AppComponent implements OnInit {
  showProfile = signal(false);
  
  constructor(public authService: AuthService, private router: Router) {}

  isAuthPage() {
    return this.router.url.includes('/auth/');
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  goHome() { this.router.navigate(['/']); }
}