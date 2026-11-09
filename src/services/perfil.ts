import { solicitarApi } from './api';

export interface Perfil {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: string;
  creado_en: string;
}

export async function obtenerPerfil(): Promise<Perfil> {
  const respuesta = await solicitarApi<Perfil>('/usuarios/me');
  return respuesta.data;
}

export async function actualizarPerfil(datos: { nombre: string; telefono: string }): Promise<Perfil> {
  const respuesta = await solicitarApi<Perfil>('/usuarios/me', {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
  return respuesta.data;
}
