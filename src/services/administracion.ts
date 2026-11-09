import { solicitarApi } from './api';

export interface UsuarioAdministracion {
  id: number;
  nombre: string;
  email: string;
  creado_en: string;
  activo: boolean;
  rol: string;
}

export interface ModuloAdministracion {
  id: number;
  titulo: string;
  descripcion: string;
  dificultad: 'Facil' | 'Media' | 'Alta';
  total_pasos: number;
  estado: 'Habilitado' | 'Borrador' | 'Deshabilitado';
}

export interface MetricasAdministracion {
  resumen: {
    usuarios: number;
    sesiones: number;
    tiempo_promedio: number;
    tasa_error: number;
    tasa_abandono: number;
  };
  modulos: Array<{
    id: number;
    titulo: string;
    total_pasos: number;
    sesiones: number;
    completadas: number;
    tasa_error: number;
  }>;
  abandonos: Array<{
    titulo: string;
    abandonos: number;
  }>;
}

export async function obtenerUsuarios(): Promise<UsuarioAdministracion[]> {
  const respuesta = await solicitarApi<UsuarioAdministracion[]>('/admin/usuarios');
  return respuesta.data;
}

export async function obtenerMetricas(): Promise<MetricasAdministracion> {
  const respuesta = await solicitarApi<MetricasAdministracion>('/admin/metricas');
  return respuesta.data;
}

export async function obtenerModulos(): Promise<ModuloAdministracion[]> {
  const respuesta = await solicitarApi<ModuloAdministracion[]>('/modulos');
  return respuesta.data;
}

export async function guardarModulo(
  modulo: Omit<ModuloAdministracion, 'id'>,
  id?: number
): Promise<ModuloAdministracion> {
  const respuesta = await solicitarApi<ModuloAdministracion>(
    id ? `/modulos/${id}` : '/modulos',
    {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(modulo),
    }
  );
  return respuesta.data;
}

export async function cambiarEstadoModulo(
  id: number,
  estado: ModuloAdministracion['estado']
): Promise<ModuloAdministracion> {
  const respuesta = await solicitarApi<ModuloAdministracion>(`/modulos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  return respuesta.data;
}
