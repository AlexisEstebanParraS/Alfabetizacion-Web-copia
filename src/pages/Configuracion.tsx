import React, { useState } from 'react';
import {
  IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList,
  IonListHeader, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar,
} from '@ionic/react';
import BotonLectura from '../components/BotonLectura';
import Aviso, { type MensajeAviso } from '../components/Aviso';
import { guardarPreferencias, obtenerPreferencias, type TamanoLetra } from '../services/preferencias';

const Configuracion: React.FC = () => {
  const [tamanoLetra, setTamanoLetra] = useState<TamanoLetra>(obtenerPreferencias().tamanoLetra);
  const [aviso, setAviso] = useState<MensajeAviso | null>(null);

  const cambiarTamano = (nuevo: TamanoLetra) => {
    try {
      guardarPreferencias({ tamanoLetra: nuevo });
      setTamanoLetra(nuevo);
      setAviso({ tipo: 'exito', texto: 'Preferencia guardada. Se mantendrá la próxima vez que abras la app.' });
    } catch {
      setAviso({ tipo: 'error', texto: 'No se pudo guardar la preferencia en este dispositivo.' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start"><IonBackButton defaultHref="/inicio" text="Inicio" /></IonButtons>
          <IonTitle>Configuración</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Accesibilidad</h1>
        <p>Estos ajustes se guardan en este dispositivo y se aplican en toda la aplicación.</p>

        <IonList>
          <IonListHeader><IonLabel>Lectura en pantalla</IonLabel></IonListHeader>
          <IonItem>
            <IonSelect
              label="Tamaño del texto"
              labelPlacement="stacked"
              value={tamanoLetra}
              onIonChange={(e) => cambiarTamano(e.detail.value as TamanoLetra)}
            >
              <IonSelectOption value="normal">Normal</IonSelectOption>
              <IonSelectOption value="grande">Grande</IonSelectOption>
              <IonSelectOption value="muy-grande">Muy grande</IonSelectOption>
            </IonSelect>
          </IonItem>

        </IonList>

        <h2>Vista previa</h2>
        <p>Así se verá el texto en las prácticas. Presiona "Escuchar" para oír cómo se leen las instrucciones.</p>
        <BotonLectura texto="Así se escuchan las instrucciones de las prácticas de Municipio Fácil." />
      </IonContent>
      <Aviso aviso={aviso} alCerrar={() => setAviso(null)} />
    </IonPage>
  );
};

export default Configuracion;
