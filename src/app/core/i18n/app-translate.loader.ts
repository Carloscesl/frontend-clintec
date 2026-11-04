import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ES } from './es';
import { EN } from './en';

const TRANSLATIONS: Record<string, TranslationObject> = {
  es: ES,
  en: EN,
};

@Injectable()
export class AppTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(TRANSLATIONS[lang] ?? TRANSLATIONS['es']);
  }
}
