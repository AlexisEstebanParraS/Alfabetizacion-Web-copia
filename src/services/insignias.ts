import type { Modulo } from './modulos';
import type { Progreso } from './progreso';

export interface Insignia {
  id: string;
  titulo: string;
  descripcion: string;  // cómo se consigue
  lograda: boolean;
}

/** Porcentaje de avance de un módulo (0 a 100). */
export function porcentajeAvance(modulo: Modulo, progreso?: Progreso): number {
  if (!progreso) return 0;
  if (progreso.completado) return 100;
  // paso_actual empieza en 1: estar en el paso 1 significa 0 pasos terminados
  const terminados = Math.max(0, progreso.paso_actual - 1);
  return Math.min(99, Math.round((terminados / modulo.total_pasos) * 100));
}

/**
 * Calcula las insignias a partir de los datos reales.
 * Es una función pura: mismos datos de entrada -> mismo resultado.
 * Por eso se puede probar sin navegador ni servidor (ver insignias.test.ts).
 */
export function calcularInsignias(modulos: Modulo[], progresos: Progreso[]): Insignia[] {
  // Solo cuentan los módulos que el ciudadano puede ver (habilitados)
  const deModulosVisibles = progresos.filter((p) => modulos.some((m) => m.id === p.modulo_id));
  const completados = deModulosVisibles.filter((p) => p.completado);
  const total = modulos.length;

  return [
    {
      id: 'primer-paso',
      titulo: 'Primer paso',
      descripcion: 'Comienza tu primera práctica.',
      lograda: deModulosVisibles.length >= 1,
    },
    {
      id: 'primera-practica',
      titulo: 'Primera práctica',
      descripcion: 'Completa una práctica de principio a fin.',
      lograda: completados.length >= 1,
    },
    {
      id: 'sin-errores',
      titulo: 'Sin errores',
      descripcion: 'Completa una práctica sin equivocarte ni una vez.',
      lograda: completados.some((p) => p.errores_cometidos === 0),
    },
    {
      id: 'constancia',
      titulo: 'Constancia',
      descripcion: 'Completa al menos la mitad de las prácticas disponibles.',
      lograda: total > 0 && completados.length >= Math.ceil(total / 2),
    },
    {
      id: 'experto',
      titulo: 'Experto municipal',
      descripcion: 'Completa todas las prácticas disponibles.',
      lograda: total > 0 && completados.length === total,
    },
  ];
}

/** 125 -> "2 min 5 s" */
export function formatearTiempo(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${minutos} min ${resto} s` : `${minutos} min`;
}
