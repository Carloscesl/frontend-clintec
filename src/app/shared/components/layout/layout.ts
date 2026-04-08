import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { ModalResultado } from '../modal-resultado/modal-resultado';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ModalResultado],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  public auth = inject(AuthService);
}
