import { Component, Input } from '@angular/core';
import {
  QUALIFICATION_CONFIG,
  QualificationLevel,
} from '../../../../core/models/calificacion.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qualification-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qualification-progress-bar.component.html',
  styleUrl: './qualification-progress-bar.component.css',
})
export class QualificationProgressBarComponent {
  @Input({ required: true }) puntaje!: number;
  @Input({ required: true }) nivel!: QualificationLevel;
  get config() {
    return QUALIFICATION_CONFIG[this.nivel];
  }
}
