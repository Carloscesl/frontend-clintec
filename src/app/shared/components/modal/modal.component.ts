import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  visible$;
  message$;
  type$;

  constructor(private readonly modalService: ModalService) {
    this.visible$ = this.modalService.visible$;
    this.message$ = this.modalService.message$;
    this.type$ = this.modalService.type$;
  }

  close() {
    this.modalService.close();
  }
}
