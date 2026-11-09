import { eliminarSesion, obtenerSesion } from './autenticacion';

export const URL_API = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

/** Error de la API con su código HTTP, para reaccionar según el caso (401, 404, 409...). */
export class ErrorApi extends Error {
  estado?: number;

  constructor(mensaje: string, estado?: number) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
  }
}

export interface RespuestaApi<T> {
  ok: boolean;
  message?: string;
  error?: { mensaje?: string; detalles?: string[] };
  data: T;
  total?: number;
}

/** Acción al recibir 401. Se puede reemplazar en las pruebas. */
let alSesionExpirada = (): void => {
  window.location.assign('/iniciar-sesion');
};
export const configurarAlSesionExpirada = (accion: () => void): void => {
  alSesionExpirada = accion;
};

/**
 * Cliente único para las rutas protegidas ("interceptor"):
 *  - agrega el JWT en Authorization,
 *  - normaliza los errores en ErrorApi con un mensaje claro,
 *  - ante 401 (token inválido o expirado) cierra la sesión y envía al login.
 */
export async function solicitarApi<T>(ruta: string, opciones: RequestInit = {}): Promise<RespuestaApi<T>> {
  const sesion = obtenerSesion();
  if (!sesion) {
    alSesionExpirada();
    throw new ErrorApi('Tu sesión terminó. Inicia sesión nuevamente.', 401);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sesion.token}`,
        ...opciones.headers,
      },
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servicio. Revisa que el servidor esté disponible.');
  }

  let resultado: RespuestaApi<T>;
  try {
    resultado = await respuesta.json() as RespuestaApi<T>;
  } catch {
    throw new ErrorApi('El servicio respondió con un formato inesperado.', respuesta.status);
  }

  if (respuesta.status === 401) {
    eliminarSesion();
    alSesionExpirada();
    throw new ErrorApi('Tu sesión expiró. Inicia sesión nuevamente.', 401);
  }

  if (!respuesta.ok || resultado.ok !== true) {
    const detalles = resultado.error?.detalles?.length ? ` ${resultado.error.detalles.join('. ')}.` : '';
    throw new ErrorApi(
      `${resultado.error?.mensaje || resultado.message || 'No se pudo completar la solicitud.'}${detalles}`,
      respuesta.status
    );
  }

  return resultado;
}
