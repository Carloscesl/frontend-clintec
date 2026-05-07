import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  // Cuántos tests corren en paralelo (2 es un buen número para empezar)
  workers: 1,

  // Qué información guardar cuando un test falla
  reporter: [
    ['html'], // genera un reporte HTML visual que puedes abrir en browser
    ['list'], // muestra resultados en la terminal
  ],

  use: {
    // URL base de tu app Angular en desarrollo
    baseURL: 'http://localhost:4200',

    // Si un test falla, guarda una "grabación" de lo que pasó para que puedas revisar
    trace: 'on-first-retry',

    // Guarda screenshot automático cuando algo falla
    screenshot: 'only-on-failure',
  },

  // En qué navegadores correr los tests
  projects: [
    {
      name: 'chromium', // Chrome
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    // Puedes agregar más después:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],

  // Levanta tu Angular app automáticamente antes de correr los tests
  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    // Si ya tienes ng serve corriendo, no lo vuelve a levantar
    reuseExistingServer: true,
    timeout: 120000, // espera hasta 2 minutos a que levante
  },
});
