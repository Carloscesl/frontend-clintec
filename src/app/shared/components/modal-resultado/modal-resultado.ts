import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-resultado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-resultado.html',
  styleUrl: './modal-resultado.css',
})
export class ModalResultado {
  modalService = inject(ModalService);
}
