import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { OpportunityMainComponent } from '../opportunity-main/opportunity-main.component';
import { OpportunityAsesorComponent } from '../opportunity-asesor/opportunity-asesor.component';

@Component({
  selector: 'app-opportunity-shell',
  standalone: true,
  imports: [CommonModule, OpportunityMainComponent, OpportunityAsesorComponent],

  template: `
    @if (esAsesor) {
      <app-opportunity-asesor />
    } @else {
      <app-opportunity-main />
    }
  `,
})
export class OpportunityShellComponent {
  private readonly authService = inject(AuthService);
  esAsesor = this.authService.obtenerRol() === 'ASESOR';
}
