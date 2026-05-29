import { test, expect, Page, APIRequestContext } from '@playwright/test';

/* =====================================================
   CONFIGURACIÓN
===================================================== */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4200';
const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';

const GERENTE_EMAIL = process.env.GERENTE_EMAIL ?? 'gerente@test.com';
const GERENTE_PASSWORD = process.env.GERENTE_PASSWORD ?? '123456';

// Admin — solo para verificar que el asesor existe (GET /usuarios requiere ADMINISTRADOR)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '123456';

// Asesor real que debe existir en la BD para asignar la oportunidad
// Ajusta el ID y email al asesor real de tu entorno
const ASESOR_ID = Number(process.env.ASESOR_ID ?? '10');
const ASESOR_EMAIL = process.env.ASESOR_EMAIL ?? 'asesor@test.com';

const RUN_ID = Date.now();
const CLIENTE_EMAIL = `gerente_pw_${RUN_ID}@test.com`;

/* =====================================================
   HELPERS
===================================================== */

/**
 * Obtiene JWT del gerente directamente desde la API.
 * Ajusta la ruta al token: body.token | body.accessToken | body.data.token
 */
async function obtenerToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: GERENTE_EMAIL, password: GERENTE_PASSWORD },
  });
  expect(res.status(), 'Login del gerente falló — revisa credenciales').toBe(200);
  const body = await res.json();
  const token = body.token ?? body.accessToken ?? body.data?.token;
  expect(token, 'No se encontró token en la respuesta').toBeTruthy();
  return token as string;
}

/** Inicia sesión desde la UI y espera redirección al dashboard de gerente. */
async function loginUI(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByTestId('email-input').fill(GERENTE_EMAIL);
  await page.getByTestId('password-input').fill(GERENTE_PASSWORD);
  await page.getByTestId('submit-button').click();
  await expect(page).toHaveURL(/dashboard\/gerente/, { timeout: 15_000 });
}

/**
 * Mockea calificaciones con [] para que el forkJoin de ClientListComponent
 * no falle por esa llamada secundaria mientras probamos clientes reales.
 */
async function mockearDependenciasSecundarias(page: Page) {
  await page.route('**/calificaciones**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  // El forkJoin de ClientListComponent también llama a /oportunidades;
  // la mockeamos aquí para que no bloquee la carga de la tabla de clientes.
  // Una vez que el test navega a /opportunities, esta ruta se sobreescribe
  // con la real porque page.route da prioridad al último handler registrado.
  await page.route('**/oportunidades**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

/* Limpieza post-test vía API */
async function eliminarCliente(request: APIRequestContext, token: string, id: number) {
  await request.delete(`${API_URL}/clientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function eliminarOportunidad(request: APIRequestContext, token: string, id: number) {
  await request.delete(`${API_URL}/oportunidades/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* =====================================================
   SUITE PRINCIPAL
===================================================== */
test.describe('Flujo Gerente CRM — Datos Reales', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    // Token del gerente — para el flujo UI y llamadas de clientes/oportunidades
    token = await obtenerToken(request);

    // Verificamos el asesor con token de admin (GET /usuarios es solo ADMINISTRADOR)
    const adminRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(adminRes.status(), 'Login admin falló').toBe(200);
    const adminBody = await adminRes.json();
    const adminToken = adminBody.token ?? adminBody.accessToken ?? adminBody.data?.token;

    const res = await request.get(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status(), 'GET /usuarios con admin falló').toBe(200);
    const usuarios: any[] = await res.json();
    const asesor = usuarios.find((u) => u.id === ASESOR_ID || u.email === ASESOR_EMAIL);
    expect(
      asesor,
      `Asesor con id=${ASESOR_ID} / email=${ASESOR_EMAIL} no encontrado en BD. ` +
        `Crea el asesor o ajusta ASESOR_ID / ASESOR_EMAIL en el .env`,
    ).toBeTruthy();
  });

  test('login + crear cliente + crear oportunidad + ver interacciones + ver ventas', async ({
    page,
    request,
  }) => {
    let clienteId: number | null = null;
    let oportunidadId: number | null = null;

    await mockearDependenciasSecundarias(page);

    try {
      /* ── LOGIN UI ── */
      await loginUI(page);

      /* ══════════════════════════════════════════
         BLOQUE 1 — CREAR CLIENTE
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/clients`);
      await expect(page.getByTestId('clients-title')).toBeVisible();

      await page
        .getByTestId('clients-loading')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 15_000 });

      await page.getByTestId('new-client-btn').click();
      await expect(page).toHaveURL(/clients\/crear/);

      await page.getByTestId('input-nombre').fill(`Cliente Gerente PW ${RUN_ID}`);
      await page.getByTestId('input-email').fill(CLIENTE_EMAIL);
      await page.getByTestId('input-telefono').fill('3007654321');
      await page.getByTestId('input-empresa').fill('Empresa Gerente E2E');
      await page.getByTestId('input-direccion').fill('Cali');
      await page.getByTestId('btn-guardar').click();

      await expect(page).toHaveURL(/\/clients$/, { timeout: 15_000 });

      await page
        .getByTestId('clients-loading')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      // Buscar la fila por email único
      const filaCliente = page.locator('[data-testid^="client-row-"]', {
        hasText: CLIENTE_EMAIL,
      });
      await expect(filaCliente).toBeVisible({ timeout: 20_000 });

      // Obtener el ID real asignado por la BD
      const resClientes = await request.get(`${API_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(resClientes.status()).toBe(200);
      const clientes: any[] = await resClientes.json();
      const clienteCreado = clientes.find((c) => c.email === CLIENTE_EMAIL);
      expect(clienteCreado, `Cliente ${CLIENTE_EMAIL} no encontrado en BD`).toBeTruthy();
      clienteId = clienteCreado.id;
      expect(clienteCreado.nombreCliente ?? clienteCreado.nombre).toContain(
        `Cliente Gerente PW ${RUN_ID}`,
      );

      /* ══════════════════════════════════════════
         BLOQUE 2 — CREAR OPORTUNIDAD
      ══════════════════════════════════════════ */
      // Desactivamos el mock de oportunidades para que este bloque
      // use datos reales contra la BD
      await page.unroute('**/oportunidades**');

      await page.goto(`${BASE_URL}/opportunities`);
      await expect(page.getByTestId('opportunities-title')).toBeVisible();

      await page
        .locator('[data-testid="opportunities-loading"]')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      await expect(page.getByTestId('asesores-grid')).toBeVisible({ timeout: 15_000 });

      await page.getByTestId('new-opportunity-btn').click();
      await expect(page).toHaveURL(/opportunities\/crear/);

      // Esperamos que el select de clientes cargue y tenga el cliente recién creado
      await expect(
        page.locator(`[data-testid="select-cliente-oportunidad"] option[value="${clienteId}"]`),
      ).toBeAttached({ timeout: 15_000 });

      // Esperamos que el select de asesores tenga el asesor real
      await expect(
        page.locator(`[data-testid="select-asesor-oportunidad"] option[value="${ASESOR_ID}"]`),
      ).toBeAttached({ timeout: 15_000 });

      await page.getByTestId('select-cliente-oportunidad').selectOption(String(clienteId));
      await page.getByTestId('select-asesor-oportunidad').selectOption(String(ASESOR_ID));
      await page
        .getByTestId('input-descripcion-oportunidad')
        .fill(`Oportunidad E2E Playwright ${RUN_ID}`);
      await page.getByTestId('input-valor-oportunidad').fill('8000000');
      await page.getByTestId('input-fecha-oportunidad').fill('2026-12-31');
      await page.getByTestId('btn-guardar-oportunidad').click();

      // Validar redirección a lista de oportunidades
      await expect(page).toHaveURL(/\/opportunities$/, { timeout: 15_000 });

      await page
        .locator('[data-testid="opportunities-loading"]')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      await expect(page.getByTestId('asesores-grid')).toBeVisible({ timeout: 15_000 });

      // El asesor debe tener su card visible
      await expect(page.getByTestId(`asesor-card-${ASESOR_ID}`)).toBeVisible({ timeout: 15_000 });

      // Obtener el ID real de la oportunidad desde la BD
      const resOps = await request.get(`${API_URL}/oportunidades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(resOps.status()).toBe(200);
      const oportunidades: any[] = await resOps.json();
      const opCreada = oportunidades.find((op) =>
        (op.descripcion ?? op.description ?? '').includes(`Oportunidad E2E Playwright ${RUN_ID}`),
      );
      expect(opCreada, 'Oportunidad no encontrada en BD').toBeTruthy();
      oportunidadId = opCreada.idOportunidad ?? opCreada.id;

      // Validar que la card de la oportunidad aparece en la UI
      const opCard = page.locator(`[data-testid="op-card-${oportunidadId}"]`);
      await expect(opCard).toBeVisible({ timeout: 15_000 });
      await expect(page.locator(`[data-testid="op-descripcion-${oportunidadId}"]`)).toContainText(
        `Oportunidad E2E Playwright ${RUN_ID}`,
      );

      /* ══════════════════════════════════════════
         BLOQUE 3 — VER INTERACCIONES
         (no creamos interacciones en este test —
          si la BD tiene datos reales aparecerán;
          solo validamos que la sección carga sin error)
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/interactions`);
      await expect(page.getByTestId('interactions-title')).toBeVisible({ timeout: 15_000 });

      // Esperamos que desaparezca el loading
      await page
        .locator('[data-testid="interactions-loading"]')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      // Validamos que no haya error — la sección puede estar vacía si no hay interacciones
      await expect(page.getByTestId('interactions-error')).not.toBeVisible();

      // Si hay datos reales, el timeline aparece; si no, el empty state
      const tieneTimeline = await page
        .getByTestId('interactions-timeline')
        .isVisible()
        .catch(() => false);

      const tieneEmpty = await page
        .getByTestId('interactions-empty')
        .isVisible()
        .catch(() => false);

      expect(
        tieneTimeline || tieneEmpty,
        'La sección de interacciones no muestra ni timeline ni empty state',
      ).toBe(true);

      /* ══════════════════════════════════════════
         BLOQUE 4 — VER VENTAS
         (igual que interacciones — validamos que
          la sección carga correctamente)
      ══════════════════════════════════════════ */
      await page.goto(`${BASE_URL}/sales`);
      await expect(page.getByTestId('sales-title')).toBeVisible({ timeout: 15_000 });

      await page
        .locator('[data-testid="sales-loading"]')
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});

      await expect(page.getByTestId('sales-error')).not.toBeVisible();
      await expect(page.getByTestId('sales-kpi-grid')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('kpi-total-ventas')).toBeVisible({ timeout: 15_000 });

      // La tabla aparece si hay ventas; si no hay, validamos que no rompe
      const tieneTabla = await page
        .getByTestId('sales-table')
        .isVisible()
        .catch(() => false);

      const tieneSalesEmpty = await page
        .getByTestId('sales-empty')
        .isVisible()
        .catch(() => false);

      expect(
        tieneTabla || tieneSalesEmpty,
        'La sección de ventas no muestra ni tabla ni empty state',
      ).toBe(true);
    } finally {
      /* ── LIMPIEZA — orden inverso a la creación ── */
      if (oportunidadId) {
        await eliminarOportunidad(request, token, oportunidadId);
        console.log(`[CLEANUP] Oportunidad ${oportunidadId} eliminada de la BD`);
      }
      if (clienteId) {
        await eliminarCliente(request, token, clienteId);
        console.log(`[CLEANUP] Cliente ${clienteId} eliminado de la BD`);
      }
    }
  });
});
