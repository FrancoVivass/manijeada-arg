import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dot-lottie-player',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <lottie-player
      *ngIf="isJson"
      [attr.src]="src"
      [attr.autoplay]="autoplay ? 'true' : null"
      [attr.loop]="isLoop ? 'true' : null"
      [style.width]="getSize(width)"
      [style.height]="getSize(height)">
    </lottie-player>

    <dotlottie-player
      *ngIf="!isJson"
      [attr.src]="src"
      [attr.autoplay]="autoplay ? 'true' : null"
      [attr.loop]="isLoop ? 'true' : null"
      [style.width]="getSize(width)"
      [style.height]="getSize(height)">
    </dotlottie-player>
  `,
  styles: [`
    :host {
      display: inline-block;
      line-height: 0;
    }
    lottie-player, dotlottie-player {
      display: block;
      margin: 0 auto;
    }
  `]
})
export class DotLottiePlayerComponent {
  @Input() src: string = '';
  @Input() isLoop: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() width: string | number = '100%';
  @Input() height: string | number = '100%';

  get isJson(): boolean {
    return this.src.toLowerCase().endsWith('.json');
  }

  getSize(value: string | number): string {
    if (typeof value === 'number') return `${value}px`;
    return value.toString();
  }
}
