import { Page } from '@playwright/test';

// ─────────────────────────────────────────────
// CREDENCIALES DE PRUEBA — ajusta según tu BD
// ─────────────────────────────────────────────
export const USUARIOS = {
  admin: { email: 'carlo@gmail.com', password: '12356', rol: 'ADMINISTRADOR' },
  gerente: { email: 'gerente@clintec.com', password: '123456', rol: 'GERENTE' },
  asesor: { email: 'asesor@clintec.com', password: '123456', rol: 'ASESOR' },
};

export async function loginComo(page: Page, rol: keyof typeof USUARIOS = 'admin') {
  const { email, password } = USUARIOS[rol];
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="submit-button"]');
  await page.waitForURL(/dashboard/i, { timeout: 15000 });
}
