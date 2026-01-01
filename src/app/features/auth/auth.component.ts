import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper" [class.register-mode]="isRegister()">
      <!-- LADO IZQUIERDO (LOGIN / REGISTRO) -->
      <div class="form-container sign-in-container">
        <form (ngSubmit)="login()" class="auth-form dark">
          <h1>Bienvenido</h1>
          <p class="text-dim">Entra para empezar la manija.</p>
          <input type="email" [(ngModel)]="loginEmail" name="email" placeholder="Email" required>
          <input type="password" [(ngModel)]="loginPassword" name="password" placeholder="Contraseña" required>
          <button type="submit" class="auth-btn main" [disabled]="loading()">
            {{ loading() ? 'ENTRANDO...' : 'ENTRAR' }}
          </button>

          <button type="button" (click)="toggleMode()" class="auth-btn outline white mobile-only" style="margin-top: 20px; width: 100%; border-color: rgba(255,255,255,0.2); font-size: 10px;">
            ¿NO TIENES CUENTA? REGÍSTRATE
          </button>

          <div *ngIf="error()" class="error-msg">{{ error() }}</div>
        </form>
      </div>

      <div class="form-container sign-up-container">
        <!-- Botón de cerrar para móvil -->
        <button type="button" (click)="toggleMode()" class="close-register-mobile mobile-only" aria-label="Cerrar registro">
          ✕
        </button>
        <form (ngSubmit)="register()" class="auth-form dark">
          <h1>Crear Cuenta</h1>
          <p class="text-dim">Únete a la comunidad de Manijeada.</p>
          <input type="text" [(ngModel)]="regName" name="displayName" placeholder="Apodo público" required>
          <input type="email" [(ngModel)]="regEmail" name="email" placeholder="Email" required>
          <input type="password" [(ngModel)]="regPassword" name="password" placeholder="Contraseña" required>
          
          <div class="legal-checks">
            <label class="check-container">
              <input type="checkbox" [(ngModel)]="isAdult" name="isAdult" required>
              <span class="checkmark"></span>
              <span class="label-text">Confirmo que soy mayor de 18 años</span>
            </label>
            <label class="check-container">
              <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required>
              <span class="checkmark"></span>
              <span class="label-text">Acepto los <a routerLink="/info/terms" target="_blank">Términos y Condiciones</a></span>
            </label>
          </div>

          <button type="submit" class="auth-btn main" [disabled]="loading() || !acceptTerms() || !isAdult()">
            {{ loading() ? 'CREANDO CUENTA...' : 'REGISTRARME' }}
          </button>

          <button type="button" (click)="toggleMode()" class="auth-btn outline white mobile-only" style="margin-top: 20px; width: 100%; border-color: rgba(255,255,255,0.2); font-size: 10px;">
            ¿YA TIENES CUENTA? INICIA SESIÓN
          </button>

          <div *ngIf="error()" class="error-msg">{{ error() }}</div>
        </form>
      </div>

      <!-- OVERLAY (PANEL QUE SE MUEVE) -->
      <div class="overlay-container">
        <div class="overlay">
          <!-- LADO QUE DICE "REGISTRARSE" -->
          <div class="overlay-panel overlay-right">
            <div class="monster-video-container neon-glow pulse">
              <video 
                autoplay 
                loop 
                muted 
                playsinline
                class="monster-video-element">
                <source src="assets/animations/monster.webm" type="video/webm">
                Tu navegador no soporta videos.
              </video>
            </div>
            <h2>¿Nuevo por aquí?</h2>
            <p>Regístrate para guardar tus logros y shots.</p>
            <button class="auth-btn outline black" (click)="toggleMode()">REGISTRARSE</button>
          </div>

          <!-- LADO QUE DICE "LOGIN" -->
          <div class="overlay-panel overlay-left">
            <div class="monster-video-container neon-glow pulse">
              <video 
                autoplay 
                loop 
                muted 
                playsinline
                class="monster-video-element">
                <source src="assets/animations/monster.webm" type="video/webm">
                Tu navegador no soporta videos.
              </video>
            </div>
            <h2>¿Ya tienes cuenta?</h2>
            <p>Vuelve al login y sigue la partida.</p>
            <button class="auth-btn outline black" (click)="toggleMode()">INICIAR SESIÓN</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #0a0a0a;
      overflow: hidden;
      display: flex;
    }

    .form-container {
      position: absolute;
      top: 0;
      height: 100%;
      transition: all 0.6s ease-in-out;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .sign-in-container { left: 0; z-index: 2; }
    .sign-up-container { left: 0; opacity: 0; z-index: 1; }

    .register-mode .sign-in-container { transform: translateX(100%); opacity: 0; }
    .register-mode .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; }

    .auth-form {
      display: flex;
      flex-direction: column;
      padding: 0 50px;
      height: 100%;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: 100%;
    }

    .auth-form.dark { background: #0a0a0a; color: white; }
    .auth-form.light { background: #0a0a0a; color: white; }

    .auth-form h1 { margin-bottom: 10px; font-weight: 900; }
    .auth-form p { margin-bottom: 30px; font-size: 0.9rem; }

    .auth-form input {
      background-color: #eee;
      border: none;
      padding: 12px 15px;
      margin: 8px 0;
      width: 100%;
      max-width: 350px;
      border-radius: 8px;
      outline: none;
    }
    .auth-form.dark input { background: #1a1a1a; color: white; border: 1px solid #333; }

    .legal-checks {
      margin: 20px 0;
      width: 100%;
      max-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
    }

    .check-container {
      display: flex;
      align-items: center;
      position: relative;
      padding-left: 35px;
      cursor: pointer;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.7);
      user-select: none;
      min-height: 25px;
    }

    .check-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 22px;
      width: 22px;
      background-color: #1a1a1a;
      border: 1px solid #333;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .check-container:hover input ~ .checkmark {
      background-color: #222;
    }

    .check-container input:checked ~ .checkmark {
      background-color: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }

    .check-container input:checked ~ .checkmark:after {
      display: block;
    }

    .check-container .checkmark:after {
      left: 7px;
      top: 3px;
      width: 6px;
      height: 11px;
      border: solid #000;
      border-width: 0 3px 3px 0;
      transform: rotate(45deg);
    }

    .label-text a {
      color: var(--accent-primary);
      text-decoration: underline;
    }

    .auth-btn {
      border-radius: 30px;
      border: 1px solid #ffffff;
      background-color: #ffffff;
      color: #000;
      font-size: 12px;
      font-weight: bold;
      padding: 12px 45px;
      letter-spacing: 1px;
      text-transform: uppercase;
      transition: transform 80ms ease-in;
      cursor: pointer;
      margin-top: 20px;
    }
    .auth-btn.main:hover { transform: scale(1.05); }
    .auth-btn.dark { background: #000; color: #fff; border-color: #000; }
    .auth-btn.outline { background: transparent; }
    .auth-btn.outline.white { color: #fff; border-color: #fff; }
    .auth-btn.outline.black { color: #000; border-color: #000; }

    /* OVERLAY */
    .overlay-container {
      position: absolute;
      top: 0;
      left: 50%;
      width: 50%;
      height: 100%;
      overflow: hidden;
      transition: transform 0.6s ease-in-out;
      z-index: 100;
    }

    .register-mode .overlay-container { transform: translateX(-100%); }

    .overlay {
      background: #ffffff;
      color: #000;
      position: relative;
      left: -100%;
      height: 100%;
      width: 200%;
      transform: translateX(0);
      transition: transform 0.6s ease-in-out;
    }

    .register-mode .overlay { transform: translateX(50%); }

    .overlay-panel {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 0 40px;
      text-align: center;
      top: 0;
      height: 100%;
      width: 50%;
      transition: transform 0.6s ease-in-out;
    }

    .overlay-left { transform: translateX(-20%); background: #ffffff; color: #000; }
    .register-mode .overlay-left { transform: translateX(0); }

    .overlay-right { right: 0; transform: translateX(0); background: #ffffff; color: #000; }
    .register-mode .overlay-right { transform: translateX(20%); }

    /* MONSTER (VIDEO CONTAINER) */
    .monster-video-container {
      width: 180px;
      height: 180px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 10;
    }

    .monster-video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
    }

    .neon-glow {
      filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
    }

    .pulse {
      animation: pulse 3s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .error-msg { color: #ff4d4d; font-size: 0.8rem; margin-top: 15px; }

    .mobile-only { display: none; }


    /* MOBILE */
    @media (max-width: 768px) {
      .mobile-only { display: block; }
      .overlay-container { display: none; }
      .form-container { 
        width: 100%; 
        transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
      }
      
      /* Login se queda quieto o se desvanece un poco */
      .sign-in-container { 
        transform: translateY(0); 
        z-index: 1;
      }
      
      /* Registro viene desde abajo */
      .sign-up-container {
        transform: translateY(100%);
        opacity: 1;
        z-index: 2;
        background: #0a0a0a;
        border-top: 1px solid rgba(255,255,255,0.1);
        border-radius: 30px 30px 0 0;
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
      }

      /* Cuando activamos registro */
      .register-mode .sign-in-container {
        transform: translateY(-20px);
        opacity: 0.3;
        filter: blur(4px);
      }
      .register-mode .sign-up-container {
        transform: translateY(0%); /* Sube completamente para ocupar toda la pantalla */
        height: 100vh; /* Ocupa toda la altura de la pantalla */
        bottom: 0;
        top: 0;
        border-radius: 0; /* Sin border radius para ocupar toda la pantalla */
        position: fixed; /* Posición fija para ocupar toda la pantalla */
        z-index: 1000;
        overflow-y: auto; /* Permite scroll si el contenido es muy largo */
        padding-top: 60px; /* Espacio para el botón de cerrar */
      }

      .register-mode .sign-up-container .auth-form {
        padding: 40px 30px; /* Más padding para mejor UX en pantalla completa */
      }

      .close-register-mobile {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1001;
      }

      .close-register-mobile:hover {
        background: rgba(255,255,255,0.2);
        transform: scale(1.1);
      }
    }
  `]
})
export class AuthComponent {
  isRegister = signal(false);
  loading = signal(false);
  error = signal('');
  
  // Legal checks
  acceptTerms = signal(false);
  isAdult = signal(false);

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  regName = '';
  regEmail = '';
  regPassword = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegister.set(!this.isRegister());
    this.error.set('');
  }

  async login() {
    this.loading.set(true);
    this.error.set('');
    try {
      const { error } = await this.authService.signIn(this.loginEmail, this.loginPassword);
      if (error) throw error;

      // Verificar si hay un código de partida pendiente
      const pendingCode = sessionStorage.getItem('pendingJoinCode');
      if (pendingCode) {
        sessionStorage.removeItem('pendingJoinCode');
        console.log('Redirigiendo a partida pendiente:', pendingCode);
        this.router.navigate(['/game/join', pendingCode]);
      } else {
        this.router.navigate(['/']);
      }

      // Limpiar el formulario
      this.loginEmail = '';
      this.loginPassword = '';
    } catch (e: any) {
      this.error.set(e.message || 'Error al entrar');
    } finally {
      this.loading.set(false);
    }
  }

  async register() {
    if (!this.acceptTerms() || !this.isAdult()) {
      this.error.set('Debes aceptar los términos y confirmar que eres mayor de 18 años.');
      return;
    }
    
    this.loading.set(true);
    this.error.set('');
    try {
      const { error } = await this.authService.signUp(this.regEmail, this.regPassword, this.regName);
      if (error) throw error;
      alert('Registro exitoso. Ahora inicia sesión.');
      this.isRegister.set(false);
      this.acceptTerms.set(false);
      this.isAdult.set(false);
    } catch (e: any) {
      this.error.set(e.message || 'Error al registrar');
    } finally {
      this.loading.set(false);
    }
  }

}
