import { test, expect, Page } from '@playwright/test';

/* =====================================================
   BASE DE DATOS FALSA
===================================================== */
const ASESOR_ID = 5;
const CLIENTE_ID = 1;
const OP_ID = 10;

const fakeDB = {
  interacciones: [] as any[],
  oportunidades: [
    {
      idOportunidad: OP_ID,
      clienteId: CLIENTE_ID,
      asesorId: ASESOR_ID,
      descripcion: 'Oportunidad de prueba E2E para asesor',
      valorEstimado: 5000000,
      probabilidad: 10,
      etapa: 'NEGOCIACION',
      estado: 'ACTIVA',
      esPotencial: false,
      ventaId: null,
      fechaCierreEstimada: '2026-12-31',
      fechaCreacion: '2026-01-01',
      fechaActualizacion: '2026-01-01',
    },
  ] as any[],
  ventas: [] as any[],
};

const CLIENTE_MOCK = {
  id: CLIENTE_ID,
  nombreCliente: 'Cliente Asesor Test',
  empresa: 'Empresa Test',
  email: 'clienteasesor@test.com',
  telefono: '3001234567',
  direccion: 'Bogotá',
  fechaRegistro: '2026-01-01',
};

test.describe('Flujo Asesor CRM (Mockeado)', () => {
  test.beforeEach(async ({ page }) => {
    fakeDB.interacciones = [];
    fakeDB.ventas = [];
    fakeDB.oportunidades = [
      {
        idOportunidad: OP_ID,
        clienteId: CLIENTE_ID,
        asesorId: ASESOR_ID,
        descripcion: 'Oportunidad de prueba E2E para asesor',
        valorEstimado: 5000000,
        probabilidad: 10,
        etapa: 'NEGOCIACION',
        estado: 'ACTIVA',
        esPotencial: false,
        ventaId: null,
        fechaCierreEstimada: '2026-12-31',
        fechaCreacion: '2026-01-01',
        fechaActualizacion: '2026-01-01',
      },
    ];

    await configurarMocks(page);
  });

  test('login + ver lista clientes + ver detalle cliente + crear interaccion + cambiar etapa a cierre ganado + registrar venta + ver lista ventas', async ({
    page,
  }) => {
    /* ── LOGIN ── */
    await page.goto('/login');
    await page.getByTestId('email-input').fill('asesor@test.com');
    await page.getByTestId('password-input').fill('123456');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL(/dashboard\/asesor/, { timeout: 10000 });

    /* ── VER LISTA DE CLIENTES ── */
    await page.goto('/clients');
    await expect(page.getByTestId('clients-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`client-row-${CLIENTE_ID}`)).toBeVisible({ timeout: 10000 });

    await page.getByTestId(`view-client-${CLIENTE_ID}`).click();

    /* ── VER DETALLE CLIENTE ── */
    await expect(page).toHaveURL(/clients\/detalle\/1/, { timeout: 10000 });
    await expect(page.getByTestId('detail-card')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('detail-nombre')).toContainText('Cliente Asesor Test');
    await expect(page.getByTestId('detail-email')).toContainText('clienteasesor@test.com');
    await expect(page.getByTestId('detail-empresa')).toContainText('Empresa Test');

    /* ── CREAR INTERACCIÓN ── */
    await page.goto('/interactions');
    await expect(page.getByTestId('interactions-title')).toBeVisible();
    await expect(page.getByTestId('new-interaction-btn')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('new-interaction-btn').click();

    await expect(page.getByTestId('select-cliente-interaccion')).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-testid="select-cliente-interaccion"] option[value="1"]'),
    ).toBeAttached({ timeout: 10000 });

    await page.getByTestId('select-cliente-interaccion').selectOption(String(CLIENTE_ID));

    await expect(
      page.locator(`[data-testid="select-oportunidad-interaccion"] option[value="${OP_ID}"]`),
    ).toBeAttached({ timeout: 10000 });

    await page.getByTestId('select-oportunidad-interaccion').selectOption(String(OP_ID));

    await page.getByTestId('tipo-btn-LLAMADA').click();

    await page
      .getByTestId('textarea-nota-interaccion')
      .fill('Llamada de seguimiento con el cliente para revisar propuesta');

    await page.getByTestId('btn-guardar-interaccion').click();

    await expect(page.getByTestId('interactions-timeline')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('interaction-item-200')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('interaction-tipo-200')).toContainText('LLAMADA');

    /* ── CAMBIAR ETAPA A CIERRE_GANADO (drag & drop) ── */
    await page.goto('/opportunities');
    await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`kanban-card-${OP_ID}`)).toBeVisible({ timeout: 10000 });

    // Scroll horizontal para que NEGOCIACION y CIERRE_GANADO queden visibles
    await page.getByTestId('kanban-board').evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await page.waitForTimeout(500);

    const card = page.getByTestId(`kanban-card-${OP_ID}`);
    const dropZone = page.getByTestId('drop-zone-CIERRE_GANADO');

    await expect(card).toBeVisible({ timeout: 5000 });
    await expect(dropZone).toBeVisible({ timeout: 5000 });

    const cardBox = await card.boundingBox();
    const dropBox = await dropZone.boundingBox();

    await page.mouse.move(cardBox!.x + cardBox!.width / 2, cardBox!.y + cardBox!.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(500);
    await page.mouse.move(dropBox!.x + dropBox!.width / 2, dropBox!.y + dropBox!.height / 2, {
      steps: 30,
    });
    await page.waitForTimeout(500);
    await page.mouse.up();
    await page.waitForTimeout(800);

    /* ── MODAL CIERRE ── */
    await expect(page.getByTestId('modal-cierre')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('btn-confirmar-cierre').click();

    /* ── REGISTRAR VENTA ── */
    await expect(page).toHaveURL(/sales\/registrar/, { timeout: 10000 });
    await expect(page.getByTestId('sale-form-title')).toBeVisible();
    await expect(page.getByTestId('sale-op-descripcion')).toContainText(
      'Oportunidad de prueba E2E',
    );

    await page.getByTestId('input-valor-venta').fill('5500000');
    await page.getByTestId('metodo-btn-TRANSFERENCIA').click();
    await page.getByTestId('textarea-notas-venta').fill('Venta cerrada con descuento del 5%');
    await page.getByTestId('btn-confirmar-venta').click();

    /* ── VER LISTA DE VENTAS ── */
    await expect(page).toHaveURL(/sales\/detalle/, { timeout: 10000 });

    await page.goto('/sales');
    await expect(page.getByTestId('sales-title')).toBeVisible();
    await expect(page.getByTestId('sales-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sale-row-300')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sale-valor-300')).toContainText('5,500,000');
  });
});

/* =====================================================
   MOCKS
===================================================== */
async function configurarMocks(page: Page) {
  /* LOGIN — asesor */
  await page.route('**/auth/login**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: ASESOR_ID,
        username: 'asesor',
        email: 'asesor@test.com',
        token: 'fake-token-asesor',
        roles: ['ASESOR'],
      }),
    });
  });

  /* CLIENTES */
  await page.route('**/clientes**', async (route, request) => {
    const url = request.url();
    const method = request.method();
    console.log('[MOCK] clientes:', method, url);

    if (method === 'GET' && /\/clientes\/\d+$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CLIENTE_MOCK),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([CLIENTE_MOCK]),
      });
      return;
    }

    await route.continue();
  });

  /* OPORTUNIDADES */
  await page.route('**/oportunidades**', async (route, request) => {
    const url = request.url();
    const method = request.method();
    console.log('[MOCK] oportunidades:', method, url);

    if (method === 'GET' && url.includes('idasesor')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.oportunidades),
      });
      return;
    }

    if (method === 'GET' && url.includes('idcliente')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.oportunidades),
      });
      return;
    }

    if (method === 'GET' && url.includes('/id/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.oportunidades[0]),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.oportunidades),
      });
      return;
    }

    if (method === 'PATCH' && url.includes('etapa')) {
      const id = Number(url.split('/oportunidades/')[1].split('/')[0]);
      fakeDB.oportunidades = fakeDB.oportunidades.map((op) =>
        op.idOportunidad === id ? { ...op, etapa: 'CIERRE_GANADO', probabilidad: 100 } : op,
      );
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }

    if (method === 'PATCH' && url.includes('ganar')) {
      const id = Number(url.split('/oportunidades/')[1].split('/')[0]);
      fakeDB.oportunidades = fakeDB.oportunidades.map((op) =>
        op.idOportunidad === id ? { ...op, estado: 'GANADA' } : op,
      );
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }

    await route.continue();
  });

  /* INTERACCIONES */
  await page.route('**/interacciones**', async (route, request) => {
    const url = request.url();
    const method = request.method();
    console.log('[MOCK] interacciones:', method, url);

    if (method === 'GET' && url.includes('usuario')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.interacciones),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.interacciones),
      });
      return;
    }

    if (method === 'POST') {
      const nueva = JSON.parse(request.postData() || '{}');
      const creada = {
        id: 200,
        clienteId: nueva.clienteId,
        usuarioId: nueva.usuarioId,
        oportunidadId: nueva.oportunidadId,
        tipo: nueva.tipo,
        nota: nueva.nota,
        fecha: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };
      fakeDB.interacciones.push(creada);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(creada),
      });
      return;
    }

    await route.continue();
  });

  /* VENTAS */
  await page.route('**/venta**', async (route, request) => {
    const url = request.url();
    const method = request.method();
    console.log('[MOCK] venta:', method, url);

    if (method === 'GET' && url.includes('buscarasesor')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.ventas),
      });
      return;
    }

    if (method === 'GET' && /\/venta\/\d+$/.test(url)) {
      const venta = fakeDB.ventas[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(venta),
      });
      return;
    }

    if (method === 'POST') {
      const dto = JSON.parse(request.postData() || '{}');
      const venta = {
        idVenta: 300,
        idOportunidad: dto.idOportunidad,
        idAsesor: dto.idAsesor,
        valorVenta: dto.valorVenta,
        paymentMethod: dto.paymentMethod,
        notas: dto.notas,
        fechaVenta: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };
      fakeDB.ventas.push(venta);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(venta),
      });
      return;
    }

    await route.continue();
  });

  /* CALIFICACIONES */
  await page.route('**/calificaciones**', async (route, request) => {
    const url = request.url();
    const method = request.method();

    if (method === 'GET' && url.includes('historial')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (method === 'GET' && url.includes('cliente')) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Sin calificación' }),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    await route.continue();
  });

  /* USUARIOS */
  await page.route('**/usuarios**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  /* DASHBOARD */
  await page.route('**/dashboard**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}
