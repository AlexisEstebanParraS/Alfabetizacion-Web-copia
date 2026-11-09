import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { stopCircleOutline, volumeMediumOutline } from 'ionicons/icons';

interface BotonLecturaProps {
  /** Texto que se leerá en voz alta (el mismo que se ve en pantalla). */
  texto: string;
  fill?: 'clear' | 'outline' | 'solid';
}

// Un poco más lenta que la velocidad normal (1): más fácil de seguir
const VELOCIDAD_LECTURA = 0.9;

/**
 * Botón "Escuchar" / "Detener" para leer en voz alta (RF03).
 * Usa la síntesis de voz del navegador (window.speechSynthesis): no necesita internet ni un servicio externo.
 * Si el navegador no la tiene, el botón no se muestra (renderizado condicional).
 */
const BotonLectura: React.FC<BotonLecturaProps> = ({ texto, fill = 'outline' }) => {
  const [leyendo, setLeyendo] = useState(false);
  const disponible = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Al salir de la pantalla se detiene la lectura
  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  if (!disponible) return null;

  const leer = () => {
    window.speechSynthesis.cancel(); // si ya estaba leyendo algo, empieza de nuevo
    const enunciado = new SpeechSynthesisUtterance(texto);
    enunciado.lang = 'es-CL';
    enunciado.rate = VELOCIDAD_LECTURA;
    enunciado.onend = () => setLeyendo(false);
    enunciado.onerror = () => setLeyendo(false);
    setLeyendo(true);
    window.speechSynthesis.speak(enunciado);
  };

  const detener = () => {
    window.speechSynthesis.cancel();
    setLeyendo(false);
  };

  return (
    <IonButton
      fill={fill}
      onClick={leyendo ? detener : leer}
      aria-label={leyendo ? 'Detener la lectura en voz alta' : 'Escuchar estas instrucciones en voz alta'}
    >
      <IonIcon slot="start" icon={leyendo ? stopCircleOutline : volumeMediumOutline} aria-hidden="true" />
      {leyendo ? 'Detener' : 'Escuchar'}
    </IonButton>
  );
};

export default BotonLectura;
