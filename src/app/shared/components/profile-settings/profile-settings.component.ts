import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../core/models/game.models';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content modern-card" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>Configuración de Cuenta</h2>
          <button class="close-btn" (click)="close.emit()">X</button>
        </header>

        <div class="modal-body">
          <!-- AVATAR SECTION -->
          <div class="section-group">
            <label>MI AVATAR</label>
            <div class="current-avatar-preview">
              <img [src]="avatarUrl()" alt="Avatar">
            </div>
            
            <div class="avatar-grid">
              <div *ngFor="let avatar of predefinedAvatars" 
                   class="avatar-option" 
                   [class.active]="avatarUrl() === avatar"
                   (click)="selectAvatar(avatar)">
                <img [src]="avatar" alt="Option">
              </div>
            </div>
            
            <div class="custom-avatar-input">
              <input type="text" [(ngModel)]="customAvatarUrl" placeholder="O pega URL de imagen custom" class="modern-input">
              <button (click)="applyCustomAvatar()" class="modern-button outline mini">APLICAR</button>
            </div>
          </div>

          <!-- NAME SECTION -->
          <div class="section-group">
            <label>APODO PÚBLICO</label>
            <input type="text" [(ngModel)]="displayName" class="modern-input" placeholder="Tu nombre en el juego">
          </div>

          <!-- ACTIONS -->
          <div class="actions-group">
            <button (click)="saveChanges()" class="modern-button" [disabled]="loading()">
              {{ loading() ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
            </button>
            
            <div class="danger-zone">
              <button (click)="logout()" class="modern-button outline danger">Cerrar Sesión</button>
              <button (click)="confirmDeleteAccount()" class="delete-link">Eliminar mi cuenta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-content {
      width: 100%;
      max-width: 450px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 30px;
      border: 1px solid var(--border-color);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .modal-header h2 { font-size: 1.2rem; font-weight: 900; letter-spacing: 1px; }
    .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-weight: bold; }

    .section-group { margin-bottom: 30px; }
    .section-group label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px; letter-spacing: 1px; }

    .current-avatar-preview {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--accent-primary);
      background: #222;
    }
    .current-avatar-preview img { width: 100%; height: 100%; object-fit: cover; }

    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    .avatar-option {
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
      background: #1a1a1a;
    }
    .avatar-option img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-option.active { border-color: var(--accent-primary); transform: scale(1.1); }
    .avatar-option:hover { border-color: rgba(255,255,255,0.3); }

    .custom-avatar-input { display: flex; gap: 10px; }
    .custom-avatar-input input { flex: 1; }
    .mini { padding: 8px 15px; font-size: 0.6rem; }

    .actions-group { display: flex; flex-direction: column; gap: 20px; margin-top: 40px; }
    
    .danger-zone {
      border-top: 1px solid var(--border-color);
      padding-top: 25px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
    }
    .danger { color: var(--danger); border-color: var(--danger); width: 100%; }
    .delete-link { background: none; border: none; color: var(--danger); font-size: 0.7rem; cursor: pointer; text-decoration: underline; opacity: 0.6; }
    .delete-link:hover { opacity: 1; }
  `]
})
export class ProfileSettingsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  loading = signal(false);
  avatarUrl = signal('');
  displayName = '';
  customAvatarUrl = '';

  predefinedAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'
  ];

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.displayName = user.user_metadata['display_name'] || '';
      // Fetch profile data from users table
      const { data: profile } = await this.authService.supabase.from('users').select('*').eq('id', user.id).single();
      if (profile) {
        this.avatarUrl.set(profile.avatar_url);
        this.displayName = profile.display_name;
      }
    }
  }

  selectAvatar(url: string) {
    this.avatarUrl.set(url);
  }

  applyCustomAvatar() {
    if (this.customAvatarUrl) {
      this.avatarUrl.set(this.customAvatarUrl);
    }
  }

  async saveChanges() {
    this.loading.set(true);
    try {
      await this.authService.updateProfile({
        display_name: this.displayName,
        avatar_url: this.avatarUrl()
      });
      this.close.emit();
    } catch (e) {
      alert('Error al guardar cambios');
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.close.emit();
    this.router.navigate(['/auth/login']);
  }

  async confirmDeleteAccount() {
    if (confirm('¿ESTÁS SEGURO? Esta acción borrará todos tus datos y logros permanentemente.')) {
      try {
        await this.authService.deleteAccount();
        this.close.emit();
        this.router.navigate(['/auth/login']);
      } catch (e) {
        alert('Error al borrar cuenta');
      }
    }
  }
}

