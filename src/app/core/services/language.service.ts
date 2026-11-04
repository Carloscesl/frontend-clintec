import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Idioma = 'es' | 'en';

export const IDIOMAS_SOPORTADOS: Idioma[] = ['es', 'en'];
const STORAGE_KEY = 'lang';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly idioma = signal<Idioma>('es');

  init(): void {
    this.setIdioma(this.idiomaInicial());
  }

  setIdioma(idioma: Idioma): void {
    this.idioma.set(idioma);
    this.translate.use(idioma);
    document.documentElement.lang = idioma;
    try {
      localStorage.setItem(STORAGE_KEY, idioma);
    } catch {
      // localStorage no disponible: se ignora
    }
  }

  toggleIdioma(): void {
    this.setIdioma(this.idioma() === 'es' ? 'en' : 'es');
  }

  private idiomaInicial(): Idioma {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado === 'es' || guardado === 'en') {
        return guardado;
      }
    } catch {
      // localStorage no disponible: se usa el idioma del navegador
    }
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
  }
}
