import { solicitarApi } from './api';

export interface Modulo {
  id: number;
  titulo: string;
  descripcion: string;
  dificultad: 'Facil' | 'Media' | 'Alta';
  total_pasos: number;
  estado: 'Habilitado' | 'Borrador' | 'Deshabilitado';
}

/** Para un ciudadano, el backend devuelve solo los módulos habilitados. */
export async function obtenerModulosDisponibles(): Promise<Modulo[]> {
  const respuesta = await solicitarApi<Modulo[]>('/modulos');
  return respuesta.data;
}

export async function obtenerModulo(id: number): Promise<Modulo> {
  const respuesta = await solicitarApi<Modulo>(`/modulos/${id}`);
  return respuesta.data;
}
