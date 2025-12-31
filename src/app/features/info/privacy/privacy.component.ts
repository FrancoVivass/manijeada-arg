import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-container fade-in">
      <header class="info-header">
        <h1>Política de <span>Privacidad</span></h1>
        <p>Tu privacidad es importante para que la manija no pare.</p>
      </header>

      <div class="content-card card">
        <section>
          <h2>1. Información que Recolectamos</h2>
          <p>Solo recolectamos los datos necesarios para que la aplicación funcione:</p>
          <ul>
            <li><strong>Email:</strong> Para gestionar tu cuenta y guardar tus logros.</li>
            <li><strong>Apodo Público:</strong> Para identificarte en las partidas.</li>
            <li><strong>Estadísticas de Juego:</strong> Cantidad de shots y retos para tu perfil.</li>
          </ul>
        </section>

        <section>
          <h2>2. Uso de la Información</h2>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Personalizar tu experiencia en el juego.</li>
            <li>Gestionar las salas y turnos en tiempo real.</li>
            <li>Mejorar la aplicación basándonos en el uso anónimo.</li>
          </ul>
        </section>

        <section>
          <h2>3. Seguridad</h2>
          <p>Toda tu información está protegida mediante Supabase y conexiones cifradas. No almacenamos contraseñas en texto plano.</p>
        </section>

        <section>
          <h2>4. Cookies y Almacenamiento Local</h2>
          <p>Utilizamos almacenamiento local para mantener tu sesión activa y que no tengas que loguearte cada vez que vuelves.</p>
        </section>

        <section>
          <h2>5. Contacto</h2>
          <p>Si tienes dudas sobre cómo tratamos tus datos, puedes contactarnos a través de la sección de Soporte.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .info-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px 100px;
    }
    .info-header {
      text-align: center;
      margin-bottom: 40px;
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
      font-size: 0.9rem;
    }

    .content-card {
      padding: 40px;
      line-height: 1.6;
    }
    section {
      margin-bottom: 35px;
    }
    h2 {
      font-size: 1.3rem;
      color: var(--accent-primary);
      margin-bottom: 15px;
      font-weight: 800;
    }
    p {
      color: var(--text-secondary);
      margin-bottom: 15px;
    }
    ul {
      padding-left: 20px;
      color: var(--text-secondary);
    }
    li {
      margin-bottom: 10px;
    }
  `]
})
export class PrivacyComponent {}
