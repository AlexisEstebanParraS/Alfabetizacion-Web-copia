import { describe, expect, it } from 'vitest';
import { calcularInsignias, formatearTiempo, porcentajeAvance } from './insignias';
import type { Modulo } from './modulos';
import type { Progreso } from './progreso';

const modulo = (id: number, total_pasos = 3): Modulo => ({
  id, titulo: `Módulo ${id}`, descripcion: '', dificultad: 'Facil', total_pasos, estado: 'Habilitado',
});
const progreso = (modulo_id: number, cambios: Partial<Progreso> = {}): Progreso => ({
  id: modulo_id, usuario_id: 1, modulo_id, completado: false, paso_actual: 1,
  errores_cometidos: 0, tiempo_segundos: 0, ...cambios,
});
const logradas = (lista: ReturnType<typeof calcularInsignias>) => lista.filter((i) => i.lograda).map((i) => i.id);

describe('insignias', () => {
  const modulos = [modulo(1), modulo(2), modulo(3), modulo(4)];

  it('sin progreso no hay insignias', () => {
    expect(logradas(calcularInsignias(modulos, []))).toEqual([]);
  });

  it('iniciar una práctica da "Primer paso"', () => {
    expect(logradas(calcularInsignias(modulos, [progreso(1)]))).toEqual(['primer-paso']);
  });

  it('completar con errores no da "Sin errores"', () => {
    const r = logradas(calcularInsignias(modulos, [progreso(1, { completado: true, errores_cometidos: 2 })]));
    expect(r).toContain('primera-practica');
    expect(r).not.toContain('sin-errores');
  });

  it('completar la mitad da "Constancia" y todas da "Experto municipal"', () => {
    const mitad = [progreso(1, { completado: true }), progreso(2, { completado: true })];
    expect(logradas(calcularInsignias(modulos, mitad))).toContain('constancia');
    expect(logradas(calcularInsignias(modulos, mitad))).not.toContain('experto');
    const todas = modulos.map((m) => progreso(m.id, { completado: true }));
    expect(logradas(calcularInsignias(modulos, todas))).toContain('experto');
  });

  it('no cuenta progreso de módulos que ya no están disponibles', () => {
    expect(logradas(calcularInsignias([modulo(1)], [progreso(9, { completado: true })]))).toEqual([]);
  });
});

describe('avance y tiempo', () => {
  it('calcula el porcentaje según el paso actual', () => {
    expect(porcentajeAvance(modulo(1, 4), undefined)).toBe(0);
    expect(porcentajeAvance(modulo(1, 4), progreso(1, { paso_actual: 3 }))).toBe(50);
    expect(porcentajeAvance(modulo(1, 4), progreso(1, { completado: true }))).toBe(100);
  });

  it('formatea segundos en minutos', () => {
    expect(formatearTiempo(45)).toBe('45 s');
    expect(formatearTiempo(125)).toBe('2 min 5 s');
    expect(formatearTiempo(180)).toBe('3 min');
  });
});
