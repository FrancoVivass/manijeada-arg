import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-container fade-in">
      <header class="info-header">
        <h1>Términos y <span>Condiciones</span></h1>
        <p>Última actualización: 31 de Diciembre, 2025</p>
      </header>

      <div class="content-card card">
        <section>
          <h2>1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar MANIJEADA, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no debes utilizar la aplicación.</p>
        </section>

        <section>
          <h2>2. Requisito de Edad (+18)</h2>
          <p>MANIJEADA es un juego destinado exclusivamente a personas adultas (18 años o más). Al utilizar esta aplicación, confirmas que tienes la edad legal para consumir bebidas alcohólicas en tu jurisdicción.</p>
        </section>

        <section>
          <h2>3. Responsabilidad del Usuario</h2>
          <p>El uso de esta aplicación es bajo tu propio riesgo. MANIJEADA es una herramienta de entretenimiento. No fomentamos el consumo excesivo de alcohol ni actividades ilegales.</p>
          <ul>
            <li>Bebe con moderación.</li>
            <li>No bebas si vas a conducir.</li>
            <li>No obligues a nadie a realizar retos con los que no se sienta cómodo.</li>
            <li>Respeta la privacidad y seguridad de los demás participantes.</li>
          </ul>
        </section>

        <section>
          <h2>4. Propiedad Intelectual</h2>
          <p>Todo el contenido, diseño, logos y animaciones de MANIJEADA son propiedad exclusiva de sus desarrolladores. Queda prohibida su reproducción sin autorización.</p>
        </section>

        <section>
          <h2>5. Privacidad de Datos</h2>
          <p>Tus datos son tratados de acuerdo a nuestra Política de Privacidad. No compartimos información personal con terceros sin tu consentimiento.</p>
        </section>

        <section>
          <h2>6. Limitación de Responsabilidad</h2>
          <p>Los desarrolladores de MANIJEADA no se hacen responsables de daños físicos, morales, legales o materiales resultantes del uso de la aplicación o de los retos propuestos.</p>
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
export class TermsComponent {}
