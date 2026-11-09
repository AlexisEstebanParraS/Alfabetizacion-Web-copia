import { ErrorApi, solicitarApi } from './api';

export interface Progreso {
  id: number;
  usuario_id: number;
  modulo_id: number;
  completado: boolean;
  paso_actual: number;
  errores_cometidos: number;
  tiempo_segundos: number;
}

export type CambiosProgreso = Partial<Pick<Progreso, 'paso_actual' | 'completado' | 'errores_cometidos' | 'tiempo_segundos'>>;

/** Progreso del usuario autenticado (el backend filtra por el usuario del token). */
export async function obtenerMisProgresos(): Promise<Progreso[]> {
  const respuesta = await solicitarApi<Progreso[]>('/progreso');
  return respuesta.data;
}

/** Inicia un módulo. Si ya estaba iniciado (409), recupera el progreso para retomarlo. */
export async function iniciarModulo(moduloId: number): Promise<Progreso> {
  try {
    const respuesta = await solicitarApi<Progreso>('/progreso', {
      method: 'POST',
      body: JSON.stringify({ modulo_id: moduloId }),
    });
    return respuesta.data;
  } catch (causa) {
    if (causa instanceof ErrorApi && causa.estado === 409) {
      const existente = (await obtenerMisProgresos()).find((p) => p.modulo_id === moduloId);
      if (existente) return existente;
    }
    throw causa;
  }
}

export async function actualizarProgreso(id: number, cambios: CambiosProgreso): Promise<Progreso> {
  const respuesta = await solicitarApi<Progreso>(`/progreso/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  });
  return respuesta.data;
}
