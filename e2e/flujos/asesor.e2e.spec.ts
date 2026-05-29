import { test, expect, Page, APIRequestContext, request as newRequest } from '@playwright/test';

/* =====================================================
   CONFIGURACIÓN
===================================================== */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4200';
const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';

const ASESOR_EMAIL = process.env.ASESOR_EMAIL ?? 'asesor@test.com';
const ASESOR_PASSWORD = process.env.ASESOR_PASSWORD ?? '123456';
const ASESOR_ID = Number(process.env.ASESOR_ID ?? '5');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'carlo@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '123456';

const RUN_ID = Date.now();

/* =====================================================
   ESTADO COMPARTIDO
===================================================== */
let asesorToken = '';
let adminToken = '';
let opId = Number(process.env.OP_ID ?? '1');
let clienteId = Number(process.env.CLIENTE_ID ?? '1');
const etapaOriginal = 'NEGOCIACION';

let interaccionIdCreada: number | null = null;
let ventaIdCreada: number | null = null;

/* =====================================================
   HELPERS
===================================================== */
async function obtenerToken(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  expect(res.status(), `Login falló para ${email}`).toBe(200);
  const body = await res.json();
  const token = body.token ?? body.accessToken ?? body.data?.token;
  expect(token, 'No se encontró token').toBeTruthy();
  return token as string;
}

async function loginUI(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByTestId('email-input').fill(ASESOR_EMAIL);
  await page.getByTestId('password-input').fill(ASESOR_PASSWORD);
  await page.getByTestId('submit-button').click();
  await expect(page).toHaveURL(/dashboard\/asesor/, { timeout: 15_000 });
}

async function mockearDependenciasSecundarias(page: Page) {
  await page.route('**/calificaciones**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

/* =====================================================
   SUITE PRINCIPAL
===================================================== */
test.describe('Flujo Asesor CRM — Datos Reales', () => {
  test.beforeAll(async ({ request }) => {
    asesorToken = await obtenerToken(request, ASESOR_EMAIL, ASESOR_PASSWORD);
    adminToken = await obtenerToken(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    const res = await request.get(`${API_URL}/oportunidades/idasesor/${ASESOR_ID}`, {
      headers: { Authorization: `Bearer ${asesorToken}` },
    });
    expect(res.status(), 'No se pudieron obtener oportunidades del asesor').toBe(200);
    const ops: any[] = await res.json();

    const opActiva = ops.find((op) => op.estado === 'ACTIVA');
    expect(
      opActiva,
      `El asesor ${ASESOR_EMAIL} no tiene oportunidades ACTIVAS. ` +
        `Ejecuta datos_iniciales.sql o ajusta OP_ID en el .env`,
    ).toBeTruthy();

    opId = opActiva.idOportunidad ?? opActiva.id;
    clienteId = opActiva.clienteId;
    console.log(`[SETUP] Usando oportunidad id=${opId}, cliente id=${clienteId}`);
  });

  /* ── CLEANUP: contexto HTTP propio, nunca depende del browser ── */
  test.afterAll(async () => {
    const ctx = await newRequest.newContext();
    try {
      if (ventaIdCreada) {
        await ctx
          .delete(`${API_URL}/venta/${ventaIdCreada}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
          .catch((e) => console.warn('[CLEANUP] No se pudo eliminar venta:', e));
        console.log(`[CLEANUP] Venta ${ventaIdCreada} eliminada`);
      }

      await ctx
        .patch(`${API_URL}/oportunidades/${opId}/etapa?etapa=${etapaOriginal}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
        .catch((e) => console.warn('[CLEANUP] No se pudo revertir etapa:', e));
      console.log(`[CLEANUP] Oportunidad ${opId} revertida a ${etapaOriginal}`);

      if (interaccionIdCreada) {
        await ctx
          .delete(`${API_URL}/interacciones/${interaccionIdCreada}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
          .catch((e) => console.warn('[CLEANUP] No se pudo eliminar interacción:', e));
        console.log(`[CLEANUP] Interacción ${interaccionIdCreada} eliminada`);
      }
    } finally {
      await ctx.dispose();
    }
  });

  test(
    'login + ver clientes + ver detalle + crear interacción + ' +
      'cambiar etapa + registrar venta + ver ventas',
    async ({ page, request }) => {
      await mockearDependenciasSecundarias(page);

      /* ══════════════════════════════════════════
         BLOQUE 1 — LOGIN
      ══════════════════════════════════════════ */
      await loginUI(page);

      /* ══════════════════════════════════════════
         BLOQUE 2 — VER LISTA DE CLIENTES
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/clients`);
      await expect(page.getByTestId('clients-title')).toBeVisible();
      await page
        .getByTestId('clients-loading')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});
      await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 15_000 });
      await expect(page.locator(`[data-testid="client-row-${clienteId}"]`)).toBeVisible({
        timeout: 15_000,
      });

      /* ══════════════════════════════════════════
         BLOQUE 3 — VER DETALLE DEL CLIENTE
      ══════════════════════════════════════════ */
      await page.getByTestId(`view-client-${clienteId}`).click();
      await expect(page).toHaveURL(new RegExp(`clients/detalle/${clienteId}`), { timeout: 15_000 });
      await expect(page.getByTestId('detail-card')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('detail-nombre')).toBeVisible();
      await expect(page.getByTestId('detail-email')).toBeVisible();
      await expect(page.getByTestId('detail-empresa')).toBeVisible();

      /* ══════════════════════════════════════════
         BLOQUE 4 — CREAR INTERACCIÓN
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/interactions`);
      await expect(page.getByTestId('interactions-title')).toBeVisible();
      await page
        .getByTestId('interactions-loading')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      await page.getByTestId('new-interaction-btn').click();
      await expect(page.getByTestId('select-cliente-interaccion')).toBeVisible({ timeout: 15_000 });

      await expect(
        page.locator(`[data-testid="select-cliente-interaccion"] option[value="${clienteId}"]`),
      ).toBeAttached({ timeout: 15_000 });

      await page.getByTestId('select-cliente-interaccion').selectOption(String(clienteId));

      await expect(
        page.locator(`[data-testid="select-oportunidad-interaccion"] option[value="${opId}"]`),
      ).toBeAttached({ timeout: 15_000 });

      await page.getByTestId('select-oportunidad-interaccion').selectOption(String(opId));

      await page.getByTestId('tipo-btn-LLAMADA').click();
      await page
        .getByTestId('textarea-nota-interaccion')
        .fill(`Llamada E2E Playwright ${RUN_ID} — seguimiento de propuesta`);

      await page.getByTestId('btn-guardar-interaccion').click();

      // Panel se cierra tras guardar
      await expect(page.getByTestId('select-cliente-interaccion')).toBeHidden({ timeout: 10_000 });

      await expect(page.getByTestId('interactions-timeline')).toBeVisible({ timeout: 15_000 });

      await expect(
        page.locator('[data-testid^="interaction-item-"]').filter({
          hasText: `Llamada E2E Playwright ${RUN_ID}`,
        }),
      ).toBeVisible({ timeout: 15_000 });

      // Guardar ID real desde BD
      const resInt = await request.get(`${API_URL}/interacciones/usuario/${ASESOR_ID}`, {
        headers: { Authorization: `Bearer ${asesorToken}` },
      });
      expect(resInt.status()).toBe(200);
      const interacciones: any[] = await resInt.json();
      const intCreada = interacciones.find((i) =>
        (i.nota ?? '').includes(`Llamada E2E Playwright ${RUN_ID}`),
      );
      expect(intCreada, 'Interacción no encontrada en BD').toBeTruthy();
      interaccionIdCreada = intCreada.id;

      /* ══════════════════════════════════════════
         BLOQUE 5 — CAMBIAR ETAPA A CIERRE_GANADO
         Estrategia: PATCH directo al backend +
         click en banner cierre-pendiente
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/opportunities`);
      await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId(`kanban-card-${opId}`)).toBeVisible({ timeout: 15_000 });

      // 1. Cambiar etapa directamente en el backend
      const resPatch = await request.patch(
        `${API_URL}/oportunidades/${opId}/etapa?etapa=CIERRE_GANADO`,
        { headers: { Authorization: `Bearer ${asesorToken}` } },
      );
      expect(resPatch.status(), 'No se pudo cambiar la etapa a CIERRE_GANADO').toBe(200);
      console.log(`[BLOQUE 5] Etapa cambiada a CIERRE_GANADO via API`);

      // 2. Recargar para que Angular refleje el nuevo estado
      await page.reload();
      await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 15_000 });

      // 3. La card ahora está en CIERRE_GANADO con estado ACTIVA
      //    → muestra el banner "cierre-pendiente"
      //    Scroll para asegurarse de que sea visible
      await page.getByTestId('kanban-board').evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      await page.waitForTimeout(500);

      await expect(page.getByTestId(`cierre-pendiente-${opId}`)).toBeVisible({ timeout: 15_000 });

      // 4. Click en el banner → abre el modal de cierre
      await page.getByTestId(`cierre-pendiente-${opId}`).click();

      // 5. Confirmar cierre ganado
      await expect(page.getByTestId('modal-cierre')).toBeVisible({ timeout: 15_000 });
      await page.getByTestId('btn-confirmar-cierre').click();

      /* ══════════════════════════════════════════
         BLOQUE 6 — REGISTRAR VENTA
      ══════════════════════════════════════════ */
      await expect(page).toHaveURL(/sales\/registrar/, { timeout: 15_000 });
      await expect(page.getByTestId('sale-form-title')).toBeVisible();
      await expect(page.getByTestId('sale-op-descripcion')).toBeVisible();

      await page.getByTestId('input-valor-venta').click({ clickCount: 3 });
      await page.getByTestId('input-valor-venta').fill('5500000');
      await page.getByTestId('metodo-btn-TRANSFERENCIA').click();
      await page
        .getByTestId('textarea-notas-venta')
        .fill(`Venta E2E Playwright ${RUN_ID} — cierre con descuento del 5%`);
      await page.getByTestId('btn-confirmar-venta').click();

      await expect(page).toHaveURL(/sales\/detalle/, { timeout: 15_000 });

      // Guardar ID real de la venta desde BD
      const resVentas = await request.get(`${API_URL}/venta/buscarasesor/${ASESOR_ID}`, {
        headers: { Authorization: `Bearer ${asesorToken}` },
      });
      expect(resVentas.status()).toBe(200);
      const ventas: any[] = await resVentas.json();
      const ventaCreada = ventas.find((v) =>
        (v.notas ?? '').includes(`Venta E2E Playwright ${RUN_ID}`),
      );
      expect(ventaCreada, 'Venta no encontrada en BD').toBeTruthy();
      ventaIdCreada = ventaCreada.idVenta ?? ventaCreada.id;

      /* ══════════════════════════════════════════
         BLOQUE 7 — VER LISTA DE VENTAS
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/sales`);
      await expect(page.getByTestId('sales-title')).toBeVisible();
      await page
        .getByTestId('sales-loading')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      await expect(page.getByTestId('sales-table')).toBeVisible({ timeout: 15_000 });

      await expect(page.locator(`[data-testid="sale-row-${ventaIdCreada}"]`)).toBeVisible({
        timeout: 15_000,
      });

      await expect(page.locator(`[data-testid="sale-valor-${ventaIdCreada}"]`)).toContainText(
        '5,500,000',
      );

      // Validar persistencia en BD
      expect(ventaCreada.valorVenta).toBe(5500000);
      expect(ventaCreada.paymentMethod ?? ventaCreada.metodoPago).toBe('TRANSFERENCIA');
    },
  );
});
