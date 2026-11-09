/**
 * Preferencias de accesibilidad guardadas en el navegador con localStorage.
 * localStorage sirve para preferencias como el tamaño de letra; no reemplaza al backend
 * y no se usa para datos personales ni credenciales.
 */

export type TamanoLetra = 'normal' | 'grande' | 'muy-grande';

export interface PreferenciasUsuario {
  tamanoLetra: TamanoLetra;
}

const CLAVE = 'municipio-facil.preferencias';

export const PREFERENCIAS_POR_DEFECTO: PreferenciasUsuario = {
  tamanoLetra: 'normal',
};

/** Tamaño base de la letra: Ionic y los estilos con "rem" crecen en proporción. */
export const ESCALA_LETRA: Record<TamanoLetra, string> = {
  normal: '100%',
  grande: '118.75%',      // 19 px
  'muy-grande': '137.5%', // 22 px
};

const esValida = (valor: unknown): valor is PreferenciasUsuario => {
  if (typeof valor !== 'object' || valor === null) return false;
  const p = valor as Record<string, unknown>;
  return typeof p.tamanoLetra === 'string' && p.tamanoLetra in ESCALA_LETRA;
};

/** Aplica el tamaño de letra a toda la app (cambia el tamaño base del documento). */
export function aplicarPreferencias(preferencias: PreferenciasUsuario): void {
  document.documentElement.style.fontSize = ESCALA_LETRA[preferencias.tamanoLetra];
}

/** Lee las preferencias guardadas; si no hay o están dañadas, usa las de por defecto. */
export function obtenerPreferencias(): PreferenciasUsuario {
  try {
    const guardadas: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
    return esValida(guardadas) ? guardadas : { ...PREFERENCIAS_POR_DEFECTO };
  } catch {
    return { ...PREFERENCIAS_POR_DEFECTO };
  }
}

/** Se llama una vez al abrir la app, antes de mostrar la primera pantalla. */
export function cargarPreferencias(): PreferenciasUsuario {
  const preferencias = obtenerPreferencias();
  aplicarPreferencias(preferencias);
  return preferencias;
}

export function guardarPreferencias(preferencias: PreferenciasUsuario): void {
  localStorage.setItem(CLAVE, JSON.stringify(preferencias));
  aplicarPreferencias(preferencias);
}
