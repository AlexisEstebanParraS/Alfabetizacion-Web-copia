import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
} from '@ionic/react';
import { bookOutline, personOutline, settingsOutline, helpCircleOutline, homeOutline, logOutOutline, ribbonOutline } from 'ionicons/icons';
import { eliminarSesion } from '../services/autenticacion';

const MenuLateral: React.FC = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    eliminarSesion();
    navigate('/bienvenida', { replace: true });
  };

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader>
        <IonToolbar style={{ '--background': '#0f5132', '--color': 'white' } as React.CSSProperties}>
          <IonTitle>Municipio Fácil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="none" style={{ marginTop: '10px' }}>
          <IonMenuToggle autoHide={false}>
            <IonItem routerLink="/inicio" routerDirection="none" style={{ marginBottom: '10px', cursor: 'pointer' }}>
              <IonIcon icon={homeOutline} slot="start" style={{ color: '#0f5132' }} />
              <IonLabel style={{ fontWeight: 'bold' }}>Inicio</IonLabel>
            </IonItem>
          </IonMenuToggle>

          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/practicar" routerDirection="root" style={{ marginBottom: '10px' }}>
              <IonIcon icon={bookOutline} slot="start" style={{ color: '#0f5132' }} />
              <IonLabel>
                <h2 style={{ fontWeight: 'bold', color: '#333' }}>Practicar</h2>
                <p>Ejercicios divertidos</p>
              </IonLabel>
            </IonItem>
          </IonMenuToggle>

          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/mi-progreso" routerDirection="root" style={{ marginBottom: '10px' }}>
              <IonIcon icon={ribbonOutline} slot="start" style={{ color: '#0f5132' }} />
              <IonLabel>
                <h2 style={{ fontWeight: 'bold', color: '#333' }}>Mi progreso</h2>
                <p>Avance e insignias</p>
              </IonLabel>
            </IonItem>
          </IonMenuToggle>

          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/perfil" routerDirection="root" style={{ marginBottom: '10px' }}>
              <IonIcon icon={personOutline} slot="start" style={{ color: '#0f5132' }} />
              <IonLabel>
                <h2 style={{ fontWeight: 'bold', color: '#333' }}>Mi Perfil</h2>
                <p>Revisa tus datos</p>
              </IonLabel>
            </IonItem>
          </IonMenuToggle>

          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/configuracion" routerDirection="root" style={{ marginBottom: '10px' }}>
              <IonIcon icon={settingsOutline} slot="start" style={{ color: '#0f5132' }} />
              <IonLabel>
                <h2 style={{ fontWeight: 'bold', color: '#333' }}>Configuración</h2>
                <p>Ajustes de letra</p>
              </IonLabel>
            </IonItem>
          </IonMenuToggle>

          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/ayuda" routerDirection="root" style={{ marginBottom: '10px' }}>
              <IonIcon icon={helpCircleOutline} slot="start" style={{ color: '#0f5132' }} />
              <IonLabel>
                <h2 style={{ fontWeight: 'bold', color: '#333' }}>Ayuda</h2>
                <p>¿Tienes dudas?</p>
              </IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonItem button onClick={cerrarSesion} style={{ marginBottom: '10px' }}>
            <IonIcon icon={logOutOutline} slot="start" style={{ color: '#0f5132' }} />
            <IonLabel style={{ fontWeight: 'bold' }}>Cerrar sesión</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default MenuLateral;
