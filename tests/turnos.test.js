import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

describe('Suite de Pruebas: API REST de Turnos (Taller Final)', () => {
  test('GET / - Información general del proyecto y regla de negocio', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.proyecto);
    assert.ok(body.reglaNegocio);
    assert.equal(body.reglaNegocio.porcentajeRecargoAplicado, '14%');
  });

  test('GET /api/turnos - Lista completa de turnos (200 OK)', async () => {
    const res = await fetch(`${BASE_URL}/api/turnos`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length >= 2);
  });

  test('GET /api/turnos/:id - Obtener turno existente (200 OK)', async () => {
    const res = await fetch(`${BASE_URL}/api/turnos/1`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, 1);
    assert.ok(body.cliente);
    assert.ok(body.placaVehiculo);
  });

  test('GET /api/turnos/:id - Turno inexistente responde 404 Not Found', async () => {
    const res = await fetch(`${BASE_URL}/api/turnos/99999`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, 'Not Found');
    assert.ok(body.mensaje.includes('99999'));
  });

  test('POST /api/turnos - Creación exitosa sin prioridad (201 Created)', async () => {
    const payload = {
      cliente: 'Mariana Duque',
      placaVehiculo: 'LMN-321',
      tipoServicio: 'Cambio de Aceite y Filtros',
      fechaHora: '2026-11-28 11:00:00',
      precioBase: 120000,
      prioritario: false
    };

    const res = await fetch(`${BASE_URL}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.cliente, payload.cliente);
    assert.equal(body.prioritario, false);
    assert.equal(body.porcentajeRecargo, 0);
    assert.equal(body.totalPagar, 120000);
  });

  test('POST /api/turnos - Creación exitosa con prioridad aplica recargo N*2% (201 Created)', async () => {
    const payload = {
      cliente: 'Esteban Osorio',
      placaVehiculo: 'RST-654',
      tipoServicio: 'Diagnóstico Computarizado',
      fechaHora: '2026-11-28 15:00:00',
      precioBase: 250000,
      prioritario: true
    };

    const res = await fetch(`${BASE_URL}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.prioritario, true);
    assert.equal(body.porcentajeRecargo, 14); // N=7 -> 14%
    // 250000 + (250000 * 0.14) = 250000 + 35000 = 285000
    assert.equal(body.totalPagar, 285000);
  });

  test('POST /api/turnos - Rechaza precioBase menor o igual a cero con 400 Bad Request', async () => {
    const payload = {
      cliente: 'Cliente Error',
      placaVehiculo: 'ERR-000',
      tipoServicio: 'Servicio Invalido',
      fechaHora: '2026-11-28 16:00:00',
      precioBase: -5000,
      prioritario: false
    };

    const res = await fetch(`${BASE_URL}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Bad Request');
    assert.ok(body.mensaje.includes('precioBase'));
  });

  test('POST /api/turnos - Rechaza payload con campos faltantes con 400 Bad Request', async () => {
    const payload = {
      cliente: 'Cliente Incompleto',
      precioBase: 100000
    };

    const res = await fetch(`${BASE_URL}/api/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'Bad Request');
    assert.ok(body.mensaje.includes('Faltan campos obligatorios'));
  });
});
