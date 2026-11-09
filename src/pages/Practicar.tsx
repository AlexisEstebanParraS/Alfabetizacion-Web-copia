import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IonBackButton, IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonContent,
  IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
import { obtenerModulosDisponibles, type Modulo } from '../services/modulos';
import { obtenerMisProgresos, type Progreso } from '../services/progreso';

const estadoDeAvance = (modulo: Modulo, progreso?: Progreso): { texto: string; color: string } => {
  if (!progreso) return { texto: 'Sin iniciar', color: 'medium' };
  if (progreso.completado) return { texto: 'Completada', color: 'success' };
  return { texto: `En curso: paso ${progreso.paso_actual} de ${modulo.total_pasos}`, color: 'warning' };
};

const Practicar: React.FC = () => {
  const location = useLocation();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [progresos, setProgresos] = useState<Progreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  // Cambiar este número vuelve a ejecutar la carga (botón Reintentar)
  const [intento, setIntento] = useState(0);

  // Carga al entrar y cada vez que el usuario vuelve a /practicar (refresca el avance).
  // Ionic mantiene la página en memoria, por eso la carga depende de la ruta activa.
  useEffect(() => {
    if (location.pathname !== '/practicar') return;
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        setModulos(await obtenerModulosDisponibles());
        setProgresos(await obtenerMisProgresos());
      } catch (causa) {
        setError(causa instanceof Error ? causa.message : 'No se pudieron cargar las prácticas.');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, [location.pathname, intento]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start"><IonBackButton defaultHref="/inicio" text="Inicio" /></IonButtons>
          <IonTitle>Practicar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Elige una práctica</h1>
        <p>Aprende con ejercicios guiados. Los datos que ingreses aquí son de ejemplo.</p>

        {cargando && <IonSpinner name="crescent" aria-label="Cargando prácticas" />}

        {!cargando && error && (
          <div role="alert">
            <p>{error}</p>
            <IonButton onClick={() => setIntento(intento + 1)}>Reintentar</IonButton>
          </div>
        )}

        {!cargando && !error && modulos.length === 0 && (
          <p>Por ahora no hay prácticas disponibles. Vuelve a intentarlo más tarde.</p>
        )}

        {!cargando && !error && modulos.map((modulo) => {
          const avance = estadoDeAvance(modulo, progresos.find((p) => p.modulo_id === modulo.id));
          return (
            <IonCard button key={modulo.id} routerLink={`/practicar/${modulo.id}`}>
              <IonCardContent>
                <h2>{modulo.titulo}</h2>
                <p>{modulo.descripcion}</p>
                <p>
                  <strong>Dificultad:</strong> {modulo.dificultad}{' '}
                  <IonBadge color={avance.color}>{avance.texto}</IonBadge>
                </p>
              </IonCardContent>
            </IonCard>
          );
        })}
      </IonContent>
    </IonPage>
  );
};

export default Practicar;
