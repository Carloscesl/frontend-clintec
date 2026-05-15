import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  QUALIFICATION_CONFIG,
  QualificationLevel,
} from '../../../../core/models/calificacion.model';

@Component({
  selector: 'app-qualification-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qualification-badge.component.html',
  styleUrl: './qualification-badge.component.css',
})
export class QualificationBadgeComponent {
  @Input({ required: true }) nivel!: QualificationLevel;
  get config() {
    return QUALIFICATION_CONFIG[this.nivel];
  }
}
