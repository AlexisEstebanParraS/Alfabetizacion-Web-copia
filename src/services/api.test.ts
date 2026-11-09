import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configurarAlSesionExpirada, ErrorApi, solicitarApi } from './api';
import { obtenerSesion } from './autenticacion';

const CLAVE_SESION = 'municipio-facil.session';
const tokenVigente = `e30.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;
const guardarSesion = () => sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
  token: tokenVigente,
  usuario: { id: 1, nombre: 'Ana', email: 'ana@correo.cl', rol_id: 1 },
}));

describe('cliente HTTP común (api.ts)', () => {
  const fetchSimulado = vi.fn();
  const alExpirar = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    fetchSimulado.mockReset();
    alExpirar.mockReset();
    vi.stubGlobal('fetch', fetchSimulado);
    configurarAlSesionExpirada(alExpirar);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('envía el token en el encabezado Authorization', async () => {
    guardarSesion();
    fetchSimulado.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true, data: [] }) });

    await solicitarApi('/modulos');

    const [, opciones] = fetchSimulado.mock.calls[0];
    expect(opciones.headers.Authorization).toBe(`Bearer ${tokenVigente}`);
  });

  it('ante 401 cierra la sesión y avisa que expiró', async () => {
    guardarSesion();
    fetchSimulado.mockResolvedValue({
      ok: false, status: 401, json: async () => ({ ok: false, error: { mensaje: 'Token inválido o expirado' } }),
    });

    await expect(solicitarApi('/modulos')).rejects.toMatchObject({ estado: 401 });
    expect(obtenerSesion()).toBeNull();
    expect(alExpirar).toHaveBeenCalledOnce();
  });

  it('devuelve el mensaje y el código del backend en otros errores', async () => {
    guardarSesion();
    fetchSimulado.mockResolvedValue({
      ok: false, status: 409, json: async () => ({ ok: false, error: { mensaje: 'Valor duplicado' } }),
    });

    const error = await solicitarApi('/progreso', { method: 'POST' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error).toMatchObject({ estado: 409, message: 'Valor duplicado' });
  });

  it('sin sesión no llama al servidor', async () => {
    await expect(solicitarApi('/modulos')).rejects.toMatchObject({ estado: 401 });
    expect(fetchSimulado).not.toHaveBeenCalled();
  });
});
