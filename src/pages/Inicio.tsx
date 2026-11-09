import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonIcon, IonCard, IonCardContent,
  IonGrid, IonRow, IonCol, IonButton
} from '@ionic/react';
import BotonLectura from '../components/BotonLectura';
import { helpCircleOutline, bookOutline, personOutline, settingsOutline, ribbonOutline } from 'ionicons/icons';
import { obtenerSesion } from '../services/autenticacion';
import { obtenerModulosDisponibles } from '../services/modulos';
import { obtenerMisProgresos } from '../services/progreso';

const Inicio: React.FC = () => {
  const sesion = obtenerSesion();
  const location = useLocation();
  const [resumen, setResumen] = useState<{ completadas: number; total: number } | null>(null);

  // Avance real del ciudadano. Ionic mantiene la página en memoria al navegar,
  // por eso se vuelve a cargar cada vez que la ruta activa es /inicio.
  useEffect(() => {
    if (location.pathname !== '/inicio') return;
    const cargar = async () => {
      try {
        const modulos = await obtenerModulosDisponibles();
        const progresos = await obtenerMisProgresos();
        const completadas = progresos.filter(
          (p) => p.completado && modulos.some((m) => m.id === p.modulo_id)
        ).length;
        setResumen({ completadas, total: modulos.length });
      } catch {
        setResumen(null);
      }
    };
    void cargar();
  }, [location.pathname]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonMenuButton style={{ color: '#0f5132' }} />
          </IonButtons>
          <IonTitle>Municipio Fácil</IonTitle>
          <IonButtons slot="end">
            <BotonLectura
              fill="clear"
              texto={`Hola${sesion ? `, ${sesion.usuario.nombre}` : ''}. ¿Qué te gustaría practicar hoy? Puedes elegir: Practicar, Mi progreso, Mi perfil, Configuración o Ayuda.`}
            />
            <IonButton fill="clear" routerLink="/ayuda">
              <IonIcon icon={helpCircleOutline} slot="start" />
              Ayuda
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f4f5f8' } as React.CSSProperties}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.8rem' }}>
              ¡Hola{sesion ? `, ${sesion.usuario.nombre}` : ''}! Bienvenido de vuelta a tu espacio de aprendizaje.
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#4b5563' }}>¿Qué te gustaría practicar hoy?</p>
            {resumen && resumen.total > 0 && (
              <div style={{ background: '#d1e7dd', color: '#0f5132', padding: '12px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px' }}>
                📘 Has completado {resumen.completadas} de {resumen.total} prácticas
              </div>
            )}
          </div>

          <h2 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Elige una actividad para comenzar</h2>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/practicar" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none', height: '100%' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '50%' }}>
                      <IonIcon icon={bookOutline} style={{ color: '#0f5132', fontSize: '32px' }} />
                    </div>
                    <div>
                      <h2 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Practicar</h2>
                      <p style={{ margin: 0, color: '#4b5563' }}>Ejercicios divertidos para aprender a usar el teléfono y la computadora sin miedo.</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/mi-progreso" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none', height: '100%' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '50%' }}>
                      <IonIcon icon={ribbonOutline} style={{ color: '#0f5132', fontSize: '32px' }} />
                    </div>
                    <div>
                      <h2 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Mi progreso</h2>
                      <p style={{ margin: 0, color: '#4b5563' }}>Mira cuánto has avanzado y las insignias que has ganado.</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/perfil" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none', height: '100%' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '50%' }}>
                      <IonIcon icon={personOutline} style={{ color: '#1565c0', fontSize: '32px' }} />
                    </div>
                    <div>
                      <h2 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Mi Perfil</h2>
                      <p style={{ margin: 0, color: '#4b5563' }}>Revisa tus datos personales y edita tu información de contacto.</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/configuracion" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none', height: '100%' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f3e5f5', padding: '16px', borderRadius: '50%' }}>
                      <IonIcon icon={settingsOutline} style={{ color: '#6a1b9a', fontSize: '32px' }} />
                    </div>
                    <div>
                      <h2 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Configuración</h2>
                      <p style={{ margin: 0, color: '#4b5563' }}>Ajusta el tamaño de la letra y los colores para leer mucho mejor.</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <IonCard button routerLink="/ayuda" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none', height: '100%' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#fff8e1', padding: '16px', borderRadius: '50%' }}>
                      <IonIcon icon={helpCircleOutline} style={{ color: '#f57f17', fontSize: '32px' }} />
                    </div>
                    <div>
                      <h2 style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Ayuda</h2>
                      <p style={{ margin: 0, color: '#4b5563' }}>¿Tienes dudas? Mira videos tutoriales o habla con un asistente.</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Inicio;
