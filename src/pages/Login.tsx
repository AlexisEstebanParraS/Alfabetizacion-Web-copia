import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonIcon, IonText
} from '@ionic/react';
import { volumeMediumOutline, helpCircleOutline, arrowForwardOutline } from 'ionicons/icons';
import { iniciarSesion } from '../services/autenticacion';
import { rutaInicioPorRol } from '../services/roles';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  const validarCredenciales = async () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identificador.trim())) {
      setError('Escribe un correo electrónico válido.');
      return;
    }
    if (password.length === 0) {
      setError('Escribe tu contraseña para continuar.');
      return;
    }

    setEnviando(true);
    try {
      const sesion = await iniciarSesion(identificador.trim(), password);
      navigate(rutaInicioPorRol(sesion.usuario.rol_id), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión. Inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Municipio Fácil</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear">
              <IonIcon slot="start" icon={volumeMediumOutline} />
              Lectura
            </IonButton>
            <IonButton fill="clear" routerLink="/ayuda">
              <IonIcon slot="start" icon={helpCircleOutline} />
              Ayuda
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f4f5f8' } as React.CSSProperties}>
        <div style={{ maxWidth: '650px', margin: '30px auto' }}>
          <IonText color="dark">
            <h2 style={{ fontWeight: 'bold', fontSize: '2rem' }}>Iniciar sesión</h2>
            <p style={{ fontSize: '1.1rem' }}>Ingresa tu correo electrónico y contraseña para continuar.</p>
          </IonText>

          <IonCard style={{ borderRadius: '12px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <IonCardContent>
              <form onSubmit={(event) => {
                event.preventDefault();
                void validarCredenciales();
              }}>
                <IonItem lines="none" style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '16px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: 'bold', color: '#333' }}>Correo electrónico</IonLabel>
                  <IonInput type="email" value={identificador} placeholder="Ej: nombre@correo.cl" onIonInput={(e) => setIdentificador(e.detail.value ?? '')} />
                </IonItem>

                <IonItem lines="none" style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
                  <IonLabel position="stacked" style={{ fontWeight: 'bold', color: '#333' }}>Contraseña</IonLabel>
                  <IonInput type="password" value={password} placeholder="Ej: MunicipioF@cil123" onIonInput={(e) => setPassword(e.detail.value ?? '')} />
                </IonItem>

                {error && <IonText color="danger"><p role="alert">{error}</p></IonText>}

                <div style={{ marginBottom: '15px' }}>
                  <IonButton fill="clear" routerLink="/registro">
                    ¿No tiene cuenta? Regístrese aquí
                  </IonButton>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <IonButton
                    type="submit"
                    disabled={enviando}
                    style={{ '--background': '#0f5132', '--border-radius': '20px', minWidth: '160px' }}
                  >
                    {enviando ? 'Comprobando...' : 'Iniciar Sesión'}
                    <IonIcon slot="end" icon={arrowForwardOutline} />
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
