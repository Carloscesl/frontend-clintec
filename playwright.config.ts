import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:4200',
    testIdAttribute: 'data-testid',

    // ── EVIDENCIAS ─────────────────────────────────────────
    screenshot: 'on', // captura en TODOS los tests (para evidencias)
    video: 'on', // graba video de cada test
    trace: 'on', // traza completa navegable en el reporte
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 500, // un poco más rápido pero aún visible para evidencias
        },
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120000,
  },

  // Carpeta de resultados
  outputDir: 'test-results/',
});
