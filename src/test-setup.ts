import '@angular/compiler';

import { inject, provideAppInitializer } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  provideTranslateService,
  provideTranslateLoader,
  TranslateService,
} from '@ngx-translate/core';
import { AppTranslateLoader } from './app/core/i18n/app-translate.loader';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Todos los tests arrancan con las traducciones en español (idioma por defecto de la app),
// de modo que los componentes que usan el pipe `translate` funcionen sin configuración extra.
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideTranslateService({
        lang: 'es',
        fallbackLang: 'es',
        loader: provideTranslateLoader(AppTranslateLoader),
      }),
      // El loader es síncrono, así que `instant()` ya devuelve texto desde el primer render
      provideAppInitializer(() => {
        inject(TranslateService).use('es');
      }),
    ],
  });
});
