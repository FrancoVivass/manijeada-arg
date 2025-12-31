import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-to-play',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="info-container fade-in">
      <header class="info-header">
        <h1>Manual de la <span>MANIJA</span></h1>
        <p>Todo lo que necesitas saber para que tu previa pase a la historia.</p>
      </header>

      <!-- SECCIÓN GENERAL -->
      <section class="general-tips card">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>
          Reglas de Oro
        </h2>
        <div class="tips-grid">
          <div class="tip-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/><path d="m4.93 4.93 14.14 14.14"/></svg>
            </span>
            <h3>Sólo +18</h3>
            <p>Este juego es exclusivo para adultos responsables.</p>
          </div>
          <div class="tip-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </span>
            <h3>Si tomas, no manejes</h3>
            <p>Designen a un conductor o pidan un Cabify/Uber.</p>
          </div>
          <div class="tip-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
            </span>
            <h3>Respeto ante todo</h3>
            <p>Nadie está obligado a hacer un reto si no se siente cómodo.</p>
          </div>
        </div>
      </section>

      <div class="games-grid">
        <!-- JUEGO 1: RULETA -->
        <section class="game-guide card">
          <div class="game-badge">DISPONIBLE</div>
          <div class="game-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/><path d="m4.93 4.93 14.14 14.14"/></svg>
          </div>
          <h2>Ruleta del Caos</h2>
          <p class="game-intro">El clásico de Manijeada. Rápido, azaroso y letal.</p>
          
          <div class="how-to-steps">
            <h3>¿Cómo se juega?</h3>
            <div class="step">
              <span class="num">1</span>
              <p>Entra al Dashboard y crea una sala. Elige un modo (Tranqui, Previa, Fiesta o Extremo).</p>
            </div>
            <div class="step">
              <span class="num">2</span>
              <p>Pasa el código a tus amigos. Verás sus nombres aparecer en la sala en tiempo real.</p>
            </div>
            <div class="step">
              <span class="num">3</span>
              <p>Sigue el orden de turnos que marca la app. Cuando sea tu turno, ¡dale a <strong>GIRAR</strong>!</p>
            </div>
            <div class="step">
              <span class="num">4</span>
              <p>Acepta el resultado. Si es un reto, el grupo decide si lo cumpliste.</p>
            </div>
          </div>
        </section>

        <!-- JUEGO 2: CARTAS -->
        <section class="game-guide card">
          <div class="game-badge">DISPONIBLE</div>
          <div class="game-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 7h6"/><path d="M9 12h6"/><path d="M9 17h6"/></svg>
          </div>
          <h2>Duelo de Cartas</h2>
          <p class="game-intro">Estrategia y traición en un mazo digital.</p>

          <div class="how-to-steps">
            <h3>¿Cómo se juega?</h3>
            <div class="step">
              <span class="num">1</span>
              <p>Elige entre diferentes modos: Mayor o Menor, Rojo o Negro, La Pirámide, 7 Loco.</p>
            </div>
            <div class="step">
              <span class="num">2</span>
              <p>Recibe cartas privadas que te dan ventajas o te obligan a acciones.</p>
            </div>
            <div class="step">
              <span class="num">3</span>
              <p>Saca cartas del mazo principal que afectan a todos los jugadores.</p>
            </div>
            <div class="step">
              <span class="num">4</span>
              <p>¡El último con cartas gana! Los demás pagan shots según las reglas.</p>
            </div>
          </div>
        </section>

        <!-- JUEGO 3: IMPOSTOR -->
        <section class="game-guide card">
          <div class="game-badge">DISPONIBLE</div>
          <div class="game-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M1 12h6M17 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>
          </div>
          <h2>El Impostor</h2>
          <p class="game-intro">¿Quién miente? Descubre al impostor entre tus amigos.</p>

          <div class="how-to-steps">
            <h3>¿Cómo se juega?</h3>
            <div class="step">
              <span class="num">1</span>
              <p>Un jugador crea la partida y elige una temática (cine, fútbol, comidas, etc.)</p>
            </div>
            <div class="step">
              <span class="num">2</span>
              <p>La app asigna secretamente una palabra a todos menos a 1-2 impostores.</p>
            </div>
            <div class="step">
              <span class="num">3</span>
              <p>Por rondas, cada jugador da pistas relacionadas con la palabra (o improvisa si es impostor).</p>
            </div>
            <div class="step">
              <span class="num">4</span>
              <p>Votan quién creen que miente. Si descubren al impostor, ¡él toma! Si sobrevive, ¡todos toman!</p>
            </div>
          </div>
        </section>

        <!-- JUEGO 4: LA BOMBA -->
        <section class="game-guide card upcoming-card">
          <div class="upcoming-badge">PRÓXIMAMENTE</div>
          <div class="game-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="9"/><path d="M18.35 5.65 19 5"/><path d="m21 3 1-1"/><path d="m19 2 1 1"/><path d="M22 1l-1 1"/><path d="M15 2h2"/></svg>
          </div>
          <h2>La Bomba Loca</h2>
          <p class="game-intro">Rapidez mental bajo presión.</p>
          <p class="game-desc">Responde categorías rápidas (ej: "Marcas de Fernet") y pasa el teléfono antes de que la bomba explote en tus manos. ¡El que la tiene cuando explota, toma!</p>
        </section>
      </div>

      <section class="faq-section">
        <h2>Preguntas Manijeras</h2>
        <div class="faq-item">
          <h3>¿Qué pasa si somos muchos?</h3>
          <p>No hay límite de jugadores. Entre más sean, ¡más caótica será la ruleta!</p>
        </div>
        <div class="faq-item">
          <h3>¿Puedo jugar con amigos que no están conmigo físicamente?</h3>
          <p>¡Sí! El juego se sincroniza por internet. Pueden jugar por videollamada perfectamente.</p>
        </div>
      </section>

      <footer class="info-footer">
        <button routerLink="/dashboard" class="modern-button large">¡ENTENDÍ TODO, EMPECEMOS!</button>
      </footer>
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
      font-size: 3.5rem;
      font-weight: 950;
      letter-spacing: -2px;
      margin-bottom: 10px;
    }
    .info-header h1 span {
      color: var(--accent-primary);
      text-shadow: 0 0 30px rgba(var(--accent-primary-rgb), 0.3);
    }
    .info-header p {
      font-size: 1.2rem;
      color: var(--text-secondary);
    }

    .card {
      padding: 40px;
      margin-bottom: 40px;
      border: 1px solid var(--border-color);
      background: rgba(255,255,255,0.02);
    }

    .general-tips h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 30px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }
    .section-icon { width: 32px; height: 32px; color: var(--accent-primary); }
    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    .tip-item {
      text-align: center;
      padding: 20px;
      background: rgba(255,255,255,0.03);
      border-radius: 20px;
    }
    .tip-item .icon { font-size: 2.5rem; display: flex; justify-content: center; margin-bottom: 15px; height: 40px; }
    .tip-item .icon svg { width: 40px; height: 40px; color: var(--accent-primary); }
    .tip-item h3 { font-size: 1.1rem; margin-bottom: 10px; color: #fff; }
    .tip-item p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4; }

    .games-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .game-guide {
      position: relative;
      overflow: hidden;
    }
    .game-badge {
      position: absolute;
      top: 20px; right: -30px;
      background: var(--success);
      color: #000;
      font-size: 0.7rem;
      font-weight: 900;
      padding: 5px 40px;
      transform: rotate(45deg);
    }
    .game-icon { width: 64px; height: 64px; margin-bottom: 20px; }
    .game-icon svg { width: 100%; height: 100%; color: var(--accent-primary); opacity: 0.8; }
    .game-guide h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 10px; }
    .game-intro { font-size: 1.2rem; color: var(--accent-primary); font-weight: 700; margin-bottom: 30px; }
    .game-desc { color: var(--text-secondary); line-height: 1.6; }

    .how-to-steps {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .how-to-steps h3 { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; opacity: 0.7; }
    .step { display: flex; align-items: flex-start; gap: 20px; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; }
    .num {
      background: var(--accent-primary);
      color: #000;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      font-weight: 950;
      flex-shrink: 0;
    }
    .step p { font-size: 1rem; color: var(--text-secondary); line-height: 1.5; }

    .upcoming-card {
      border-style: dashed;
      opacity: 0.7;
    }
    .upcoming-badge {
      position: absolute;
      top: 20px; right: 20px;
      background: var(--accent-secondary);
      color: #000;
      font-size: 0.7rem;
      font-weight: 900;
      padding: 6px 15px;
      border-radius: 8px;
    }

    .faq-section {
      padding: 40px 0;
    }
    .faq-section h2 { font-size: 2rem; font-weight: 900; margin-bottom: 30px; }
    .faq-item { margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; }
    .faq-item h3 { font-size: 1.2rem; margin-bottom: 10px; color: #fff; }
    .faq-item p { color: var(--text-secondary); line-height: 1.6; }

    .info-footer {
      text-align: center;
      margin-top: 40px;
    }
    .modern-button.large {
      padding: 20px 60px;
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .info-header h1 { font-size: 2.5rem; }
      .game-guide h2 { font-size: 1.8rem; }
      .card { padding: 25px; }
    }
  `]
})
export class HowToPlayComponent {}
