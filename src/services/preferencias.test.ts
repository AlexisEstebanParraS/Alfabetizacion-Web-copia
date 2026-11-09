import { beforeEach, describe, expect, it } from 'vitest';
import { cargarPreferencias, guardarPreferencias, PREFERENCIAS_POR_DEFECTO } from './preferencias';

describe('preferencias de accesibilidad (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = '';
  });

  it('sin nada guardado usa los valores por defecto', () => {
    expect(cargarPreferencias()).toEqual(PREFERENCIAS_POR_DEFECTO);
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('guarda, aplica y recupera el tamaño de letra al volver a abrir la app', () => {
    guardarPreferencias({ tamanoLetra: 'muy-grande' });
    expect(document.documentElement.style.fontSize).toBe('137.5%');

    document.documentElement.style.fontSize = '';
    expect(cargarPreferencias().tamanoLetra).toBe('muy-grande'); // simula reabrir la app
    expect(document.documentElement.style.fontSize).toBe('137.5%');
  });

  it('ignora datos guardados dañados', () => {
    localStorage.setItem('municipio-facil.preferencias', '{"tamanoLetra":"enorme"}');
    expect(cargarPreferencias()).toEqual(PREFERENCIAS_POR_DEFECTO);
    localStorage.setItem('municipio-facil.preferencias', '{no es json');
    expect(cargarPreferencias()).toEqual(PREFERENCIAS_POR_DEFECTO);
  });
});
