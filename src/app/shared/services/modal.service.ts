import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly visibleSubject = new BehaviorSubject<boolean>(false);
  visible$ = this.visibleSubject.asObservable();

  private readonly messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();

  private readonly typeSubject = new BehaviorSubject<'success' | 'error' | 'warning'>('success');
  type$ = this.typeSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.messageSubject.next(message);
    this.typeSubject.next(type);
    this.visibleSubject.next(true);

    setTimeout(() => {
      this.close();
    }, 3000);
  }

  close() {
    this.visibleSubject.next(false);
  }
}
