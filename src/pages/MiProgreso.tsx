import React, { useEffect, useState } from 'react';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonPage, IonProgressBar, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
import { lockClosedOutline, ribbonOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { obtenerModulosDisponibles, type Modulo } from '../services/modulos';
import { obtenerMisProgresos, type Progreso } from '../services/progreso';
import { calcularInsignias, formatearTiempo, porcentajeAvance } from '../services/insignias';
import './MiProgreso.css';

const MiProgreso: React.FC = () => {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [progresos, setProgresos] = useState<Progreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const location = useLocation();

  // Carga al entrar y cada vez que el usuario vuelve a /mi-progreso (después de practicar)
  useEffect(() => {
    if (location.pathname !== '/mi-progreso') return;
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        setModulos(await obtenerModulosDisponibles());
        setProgresos(await obtenerMisProgresos());
      } catch (causa) {
        setError(causa instanceof Error ? causa.message : 'No se pudo cargar tu progreso.');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, [location.pathname, intento]);

  const progresoDe = (modulo: Modulo) => progresos.find((p) => p.modulo_id === modulo.id);
  const visibles = progresos.filter((p) => modulos.some((m) => m.id === p.modulo_id));
  const completadas = visibles.filter((p) => p.completado).length;
  const tiempoTotal = visibles.reduce((suma, p) => suma + p.tiempo_segundos, 0);
  const erroresCorregidos = visibles.reduce((suma, p) => suma + p.errores_cometidos, 0);
  const insignias = calcularInsignias(modulos, progresos);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start"><IonBackButton defaultHref="/inicio" text="Inicio" /></IonButtons>
          <IonTitle>Mi progreso</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <main className="progreso-shell">
          <h1>Mi progreso</h1>

          {cargando && <IonSpinner name="crescent" aria-label="Cargando tu progreso" />}

          {!cargando && error && (
            <div role="alert">
              <p>{error}</p>
              <IonButton onClick={() => setIntento(intento + 1)}>Reintentar</IonButton>
            </div>
          )}

          {!cargando && !error && (
            <>
              <section className="progreso-resumen" aria-label="Resumen">
                <div className="progreso-dato">
                  <strong>{completadas} de {modulos.length}</strong>
                  <span>prácticas completadas</span>
                </div>
                <div className="progreso-dato">
                  <strong>{formatearTiempo(tiempoTotal)}</strong>
                  <span>tiempo practicando</span>
                </div>
                <div className="progreso-dato">
                  <strong>{erroresCorregidos}</strong>
                  <span>errores que ya corregiste</span>
                </div>
              </section>

              <h2>Avance por práctica</h2>
              {modulos.length === 0 && <p>Todavía no hay prácticas disponibles.</p>}
              {modulos.map((modulo) => {
                const avance = porcentajeAvance(modulo, progresoDe(modulo));
                return (
                  <div className="progreso-modulo" key={modulo.id}>
                    <div className="progreso-modulo-titulo">
                      <span>{modulo.titulo}</span>
                      <strong>{avance === 100 ? 'Completada' : `${avance}%`}</strong>
                    </div>
                    <IonProgressBar
                      value={avance / 100}
                      aria-label={`Avance en ${modulo.titulo}: ${avance} por ciento`}
                    />
                  </div>
                );
              })}

              <h2>Mis insignias</h2>
              <p>Las insignias en gris todavía no las tienes: debajo dice cómo conseguirlas.</p>
              <section className="insignias" aria-label="Insignias">
                {insignias.map((insignia) => (
                  <div
                    key={insignia.id}
                    className={`insignia${insignia.lograda ? '' : ' insignia-bloqueada'}`}
                    aria-label={`${insignia.titulo}: ${insignia.lograda ? 'conseguida' : 'pendiente'}. ${insignia.descripcion}`}
                  >
                    <IonIcon icon={insignia.lograda ? ribbonOutline : lockClosedOutline} aria-hidden="true" />
                    <h3>{insignia.titulo}</h3>
                    <p>{insignia.descripcion}</p>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
};

export default MiProgreso;
