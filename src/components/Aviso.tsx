import React from 'react';
import { IonToast } from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

export interface MensajeAviso {
  texto: string;
  tipo: 'exito' | 'error';
}

interface AvisoProps {
  aviso: MensajeAviso | null;
  alCerrar: () => void;
}

/**
 * Notificación breve dentro de la app (IonToast) con el mismo aspecto en todas las pantallas.
 * La página guarda el mensaje en su estado: con un mensaje se muestra; con null se oculta.
 * Los errores duran más, porque la persona necesita tiempo para leerlos.
 */
const Aviso: React.FC<AvisoProps> = ({ aviso, alCerrar }) => {
  const esError = aviso?.tipo === 'error';
  return (
    <IonToast
      isOpen={aviso !== null}
      message={aviso?.texto}
      color={esError ? 'danger' : 'success'}
      icon={esError ? alertCircleOutline : checkmarkCircleOutline}
      duration={esError ? 5000 : 3000}
      position="top"
      buttons={[{ text: 'Cerrar', role: 'cancel' }]}
      onDidDismiss={alCerrar}
    />
  );
};

export default Aviso;
