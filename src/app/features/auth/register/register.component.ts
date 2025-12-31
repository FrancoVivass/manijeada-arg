import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in auth-container">
      <div class="modern-card auth-card">
        <div class="auth-header">
          <h1>Registro</h1>
          <p class="text-dim">Crea tu cuenta para guardar tus logros.</p>
        </div>

        <form (ngSubmit)="register()">
          <div class="form-group">
            <label class="text-dim">Nombre Público</label>
            <input type="text" [(ngModel)]="displayName" name="displayName" class="modern-input" required placeholder="Tu apodo">
          </div>

          <div class="form-group">
            <label class="text-dim">Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="modern-input" required placeholder="tu@email.com">
          </div>
          
          <div class="form-group">
            <label class="text-dim">Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" class="modern-input" required placeholder="••••••••">
          </div>

          <button type="submit" class="modern-button" [disabled]="loading" style="margin-top: 10px;">
            {{ loading ? 'CREANDO CUENTA...' : 'REGISTRARME' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p class="text-dim">¿Ya tienes cuenta? <a routerLink="/auth/login" class="text-accent">Entra aquí</a></p>
        </div>

        <div *ngIf="error" class="error-toast">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 200px);
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 40px 30px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-header h1 {
      font-size: 2rem;
      margin-bottom: 8px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 4px;
    }
    .form-group label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .auth-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 0.9rem;
    }
    .auth-footer a {
      text-decoration: none;
      font-weight: 600;
    }
    .error-toast {
      background: rgba(255, 77, 77, 0.1);
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 12px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 0.85rem;
      text-align: center;
    }
  `]
})
export class RegisterComponent {
  email = '';
  password = '';
  displayName = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    this.loading = true;
    this.error = '';
    try {
      const { data, error } = await this.authService.signUp(this.email, this.password, this.displayName);
      if (error) throw error;
      alert('Registro exitoso. Ahora inicia sesión.');
      this.router.navigate(['/auth/login']);
    } catch (e: any) {
      this.error = e.message || 'Error al registrar';
    } finally {
      this.loading = false;
    }
  }
}
