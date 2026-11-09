import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configurarAlSesionExpirada } from './api';
import { iniciarModulo } from './progreso';

const tokenVigente = `e30.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;
const respuesta = (status: number, cuerpo: unknown) => ({ ok: status < 400, status, json: async () => cuerpo });

describe('servicio de progreso', () => {
  const fetchSimulado = vi.fn();

  beforeEach(() => {
    sessionStorage.setItem('municipio-facil.session', JSON.stringify({
      token: tokenVigente,
      usuario: { id: 7, nombre: 'Ana', email: 'ana@correo.cl', rol_id: 1 },
    }));
    fetchSimulado.mockReset();
    vi.stubGlobal('fetch', fetchSimulado);
    configurarAlSesionExpirada(() => undefined);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('envía solo modulo_id al iniciar (el usuario sale del token)', async () => {
    fetchSimulado.mockResolvedValue(respuesta(201, { ok: true, data: { id: 1, modulo_id: 2 } }));

    await iniciarModulo(2);

    const [url, opciones] = fetchSimulado.mock.calls[0];
    expect(url).toMatch(/\/progreso$/);
    expect(JSON.parse(opciones.body)).toEqual({ modulo_id: 2 });
  });

  it('si el módulo ya estaba iniciado (409) retoma el progreso existente', async () => {
    const existente = { id: 5, modulo_id: 2, paso_actual: 2, completado: false };
    fetchSimulado
      .mockResolvedValueOnce(respuesta(409, { ok: false, error: { mensaje: 'duplicado' } }))
      .mockResolvedValueOnce(respuesta(200, { ok: true, data: [existente] }));

    await expect(iniciarModulo(2)).resolves.toEqual(existente);
  });
});
