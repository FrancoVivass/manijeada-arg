import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="info-container fade-in">
      <header class="info-header">
        <h1>Soporte <span>Técnico</span></h1>
        <p>¿Algo no anda bien? Contanos y lo arreglamos.</p>
      </header>

      <div class="support-grid">
        <div class="support-info">
          <div class="card">
            <h2>Preguntas Frecuentes</h2>
            <div class="faq">
              <div class="faq-item">
                <h3>¿La app es gratis?</h3>
                <p>¡Sí! MANIJEADA es y será siempre gratuita para elevar tus previas.</p>
              </div>
              <div class="faq-item">
                <h3>¿Puedo jugar sin cuenta?</h3>
                <p>Sí, podés usar el modo "Invitado", pero no se guardarán tus logros ni estadísticas.</p>
              </div>
              <div class="faq-item">
                <h3>¿Qué hago si se traba la ruleta?</h3>
                <p>Asegurate de tener una buena conexión a internet. Si el problema persiste, reiniciá la sala.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="support-form card">
          <h2>Envianos un Mensaje</h2>
          <form (ngSubmit)="sendSupport()">
            <div class="form-group">
              <label>Asunto</label>
              <select [(ngModel)]="subject" name="subject">
                <option value="bug">Reportar un Bug</option>
                <option value="suggestion">Sugerencia de Reto</option>
                <option value="other">Otro Motivo</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tu Mensaje</label>
              <textarea [(ngModel)]="message" name="message" placeholder="Escribí acá..." required></textarea>
            </div>
            <button type="submit" class="modern-button" [disabled]="!message">ENVIAR REPORTE</button>
          </form>
          <div *ngIf="sent" class="success-msg fade-in">¡Gracias! Vamos a revisarlo pronto.</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-container {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px 100px;
    }
    .info-header {
      text-align: center;
      margin-bottom: 60px;
    }
    .info-header h1 {
      font-size: 2.5rem;
      font-weight: 900;
    }
    .info-header h1 span {
      color: var(--accent-primary);
    }
    .info-header p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .support-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .card {
      padding: 30px;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 25px;
      color: var(--accent-primary);
    }

    .faq-item {
      margin-bottom: 25px;
    }
    .faq-item h3 {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: #fff;
    }
    .faq-item p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }
    select, textarea {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: #fff;
      padding: 12px;
      font-size: 0.9rem;
      outline: none;
    }
    textarea {
      height: 150px;
      resize: none;
    }
    select:focus, textarea:focus {
      border-color: var(--accent-primary);
    }

    .modern-button {
      width: 100%;
    }

    .success-msg {
      margin-top: 20px;
      color: var(--success);
      font-weight: 700;
      text-align: center;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .support-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SupportComponent {
  subject = 'bug';
  message = '';
  sent = false;

  sendSupport() {
    console.log('Soporte enviado:', { subject: this.subject, message: this.message });
    this.sent = true;
    this.message = '';
    setTimeout(() => this.sent = false, 5000);
  }
}
