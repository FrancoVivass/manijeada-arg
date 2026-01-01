import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  template: `<canvas #qrcodeCanvas></canvas>`,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      padding: 10px;
      background: white;
      border-radius: 10px;
    }
    canvas {
      max-width: 100%;
      height: auto !important;
    }
  `]
})
export class QrCodeComponent implements AfterViewInit, OnChanges {
  @Input() value: string = '';
  @Input() size: number = 250;

  @ViewChild('qrcodeCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.generateQR();
  }

  ngOnChanges() {
    if (this.canvas) {
      this.generateQR();
    }
  }

  private generateQR() {
    if (!this.value) return;
    
    QRCode.toCanvas(this.canvas.nativeElement, this.value, {
      width: this.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, (error) => {
      if (error) console.error('Error generating QR code', error);
    });
  }
}


