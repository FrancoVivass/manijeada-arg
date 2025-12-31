import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouletteOption } from '../../../core/models/game.models';

@Component({
  selector: 'app-roulette',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="roulette-container">
      <!-- Glow Effect Behind -->
      <div class="roulette-outer-glow" [class.spinning]="isSpinning()"></div>

      <div class="roulette-wrapper">
        <!-- The Needle (Fixed at top) -->
        <div class="needle-container">
          <div class="needle"></div>
        </div>
        
        <!-- The Wheel -->
        <div class="wheel-outer-border">
          <div class="wheel-body" [style.transform]="'rotate(' + rotation() + 'deg)'">
            <!-- Slices Background -->
            <div class="slices-container" [style.background]="conicGradient()"></div>
            
            <!-- Slice Dividers -->
            <div class="dividers-container">
              <div *ngFor="let opt of options; let i = index" 
                   class="divider" 
                   [style.transform]="'rotate(' + (i * sliceAngle()) + 'deg)'">
              </div>
            </div>

            <!-- Labels Layer -->
            <div class="labels-container">
              <div *ngFor="let opt of options; let i = index" 
                   class="label-wrapper" 
                   [style.transform]="'rotate(' + (i * sliceAngle() + (sliceAngle() / 2)) + 'deg)'">
                <span class="label-text" [class.dark-text]="isLightColor(opt.color)">
                  {{ opt.label }}
                </span>
              </div>
            </div>

            <!-- Shiny Overlays -->
            <div class="wheel-shine"></div>
          </div>
        </div>

        <!-- Center Hub / Spin Button -->
        <div class="center-hub">
          <div class="hub-base"></div>
          <button (click)="spin()" 
                  [disabled]="disabled || isSpinning()" 
                  class="spin-button"
                  [class.is-spinning]="isSpinning()">
            <span class="spin-label">{{ isSpinning() ? '...' : 'GIRAR' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .roulette-container {
      position: relative;
      width: 360px;
      height: 360px;
      margin: 40px auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .roulette-outer-glow {
      position: absolute;
      width: 110%;
      height: 110%;
      background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
      opacity: 0.1;
      filter: blur(40px);
      transition: opacity 0.5s ease;
      z-index: 0;
    }
    .roulette-outer-glow.spinning {
      opacity: 0.3;
      animation: pulse-glow 2s infinite ease-in-out;
    }

    .roulette-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    /* NEEDLE */
    .needle-container {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
    }
    .needle {
      width: 0;
      height: 0;
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-top: 50px solid #fff;
      position: relative;
    }
    .needle::after {
      content: '';
      position: absolute;
      top: -53px;
      left: -15px;
      width: 30px;
      height: 10px;
      background: #eee;
      border-radius: 5px 5px 0 0;
    }

    /* WHEEL BODY */
    .wheel-outer-border {
      width: 100%;
      height: 100%;
      padding: 12px;
      background: #1a1a1a;
      border-radius: 50%;
      box-shadow: 0 15px 35px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1);
    }

    .wheel-body {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      transition: transform 4.5s cubic-bezier(0.15, 0, 0.15, 1);
      box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
      border: 4px solid #000;
    }

    .slices-container {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 1;
    }

    .dividers-container {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 2;
    }
    .divider {
      position: absolute;
      top: 0; left: 50%;
      width: 2px;
      height: 50%;
      background: rgba(0,0,0,0.2);
      transform-origin: bottom center;
    }

    .labels-container {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 5;
    }
    .label-wrapper {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 45px;
    }
    .label-text {
      font-size: 0.85rem;
      font-weight: 950;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 2px 5px rgba(0,0,0,0.8);
      max-width: 80px;
      text-align: center;
      line-height: 1.1;
      display: block;
    }
    .dark-text {
      color: #000 !important;
      text-shadow: 0 1px 2px rgba(255,255,255,0.3) !important;
    }

    .wheel-shine {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%);
      z-index: 10;
      pointer-events: none;
    }

    /* CENTER HUB */
    .center-hub {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      z-index: 110;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hub-base {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #111;
      border: 6px solid #222;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    }
    .spin-button {
      position: relative;
      width: 75px;
      height: 75px;
      background: var(--accent-primary);
      border: none;
      border-radius: 50%;
      color: #000;
      font-weight: 900;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 5px 0 #b38b00, 0 8px 15px rgba(0,0,0,0.3);
      transition: all 0.1s;
      z-index: 10;
    }
    .spin-button:active:not(:disabled) {
      transform: translateY(3px);
      box-shadow: 0 2px 0 #b38b00;
    }
    .spin-button:disabled {
      cursor: not-allowed;
      filter: grayscale(0.8);
      opacity: 0.8;
    }
    .spin-button.is-spinning {
      animation: hub-pulse 1s infinite alternate;
    }

    @keyframes pulse-glow {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
    }

    @keyframes hub-pulse {
      from { box-shadow: 0 5px 0 #b38b00, 0 0 10px var(--accent-primary); }
      to { box-shadow: 0 5px 0 #b38b00, 0 0 30px var(--accent-primary); }
    }
  `]
})
export class RouletteComponent {
  @Input() options: RouletteOption[] = [];
  @Input() disabled = false;
  @Output() result = new EventEmitter<RouletteOption>();

  rotation = signal(0);
  isSpinning = signal(false);

  sliceAngle = computed(() => 360 / (this.options.length || 1));

  conicGradient = computed(() => {
    if (!this.options.length) return '#333';
    let currentAngle = 0;
    const angle = this.sliceAngle();
    const parts = this.options.map(opt => {
      const start = currentAngle;
      currentAngle += angle;
      return `${opt.color} ${start}deg ${currentAngle}deg`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  });

  isLightColor(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }

  spin() {
    if (this.isSpinning() || this.disabled || !this.options.length) return;
    this.isSpinning.set(true);
    
    const extraSpins = 6 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = (extraSpins * 360) + randomAngle;
    
    const currentRotation = this.rotation();
    this.rotation.set(currentRotation + totalRotation);

    setTimeout(() => {
      this.isSpinning.set(false);
      const normalizedRotation = (currentRotation + totalRotation) % 360;
      
      // La aguja está arriba (0 grados).
      // El giro es horario. Si gira 90 grados, el que queda arriba es el que estaba a -90 (o 270).
      const winningAngle = (360 - (normalizedRotation % 360)) % 360;
      let winningSliceIndex = Math.floor(winningAngle / this.sliceAngle());
      winningSliceIndex = winningSliceIndex % this.options.length;
      
      this.result.emit(this.options[winningSliceIndex]);
    }, 4600);
  }
}
