import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonIcon
} from '@ionic/react';
import {
  volumeMediumOutline, helpCircleOutline, arrowBackOutline,
  arrowForwardOutline, alertCircleOutline, checkmarkCircleOutline, syncOutline
} from 'ionicons/icons';
import { registrarUsuario } from '../services/autenticacion';

const Registro: React.FC = () => {
  const [etapa, setEtapa] = useState<number>(1);
  const [mostrarGuia, setMostrarGuia] = useState<boolean>(false);
  const [errorPaso, setErrorPaso] = useState<boolean>(false);
  const [mensajeError, setMensajeError] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const validarNombre = () => {
    if (nombre.trim().length === 0) {
      setErrorPaso(true);
    } else {
      setErrorPaso(false);
      setMostrarGuia(false);
      setEtapa(2);
    }
  };

  const validarCredenciales = async () => {
    const correo = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setErrorPaso(true);
      setMensajeError('Escribe un correo válido para crear tu cuenta (por ejemplo: nombre@correo.cl).');
      return;
    }
    if (password.length < 8
      || !/[a-z]/.test(password)
      || !/[A-Z]/.test(password)
      || !/[0-9]/.test(password)
      || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setErrorPaso(true);
      setMensajeError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorPaso(true);
      setMensajeError('Las contraseñas no coinciden. Revísalas e inténtalo nuevamente.');
      return;
    }

    setErrorPaso(false);
    setMensajeError('');
    setEnviando(true);
    try {
      await registrarUsuario(nombre.trim(), correo, password);
      setMostrarGuia(false);
      setEtapa(3);
    } catch (cause) {
      setErrorPaso(true);
      setMensajeError(cause instanceof Error ? cause.message : 'No se pudo crear la cuenta. Inténtalo nuevamente.');
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
            <IonButton fill="clear" routerLink="/ayuda">
              <IonIcon slot="start" icon={volumeMediumOutline} />
              Lectura
            </IonButton>
            <IonButton fill="clear">
              <IonIcon slot="start" icon={helpCircleOutline} />
              Ayuda
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f4f5f8' } as React.CSSProperties}>
        <div style={{ maxWidth: '750px', margin: '20px auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: '#0f5132', fontWeight: 'bold' }}>Intentos ilimitados</span>
            {etapa < 3 && (
              <IonButton
                fill="outline"
                size="small"
                onClick={() => {
                  if (etapa === 2) setEtapa(1);
                  else window.history.back();
                }}
                style={{ '--border-radius': '10px' }}
              >
                <IonIcon slot="start" icon={arrowBackOutline} />
                Atrás
              </IonButton>
            )}
          </div>

          {errorPaso && (
            <div style={{ background: '#fde8e8', border: '1px solid #f8b4b4', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '28px', color: '#c81e1e' }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#9b1c1c', fontWeight: 'bold' }}>Todavía falta un dato</h3>
                <p style={{ margin: 0, color: '#9b1c1c' }}>
                  {mensajeError || (etapa === 1
                    ? 'No has puesto tu nombre. No pasó nada: puedes corregirlo ahora.'
                    : 'Revisa el correo y las contraseñas. Puedes corregir los datos ahora.')}
                </p>
              </div>
            </div>
          )}

          {etapa === 1 && (
            <IonCard style={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <IonCardContent>
                <h2 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Haz esto para continuar</h2>
                {!mostrarGuia ? (
                  <>
                    <IonItem lines="none" style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
                      <IonLabel position="stacked" style={{ fontWeight: 'bold', color: '#333' }}>Nombre</IonLabel>
                      <IonInput value={nombre} placeholder="Ej: Gabriel" onIonInput={(e) => setNombre(e.detail.value ?? '')} />
                    </IonItem>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonButton fill="outline" onClick={() => setMostrarGuia(true)} style={{ '--border-radius': '10px' }}>
                        <IonIcon slot="start" icon={syncOutline} /> Ver la explicación
                      </IonButton>
                      <IonButton onClick={validarNombre} style={{ '--background': '#0f5132', '--border-radius': '20px', minWidth: '150px' }}>
                        Continuar <IonIcon slot="end" icon={arrowForwardOutline} />
                      </IonButton>
                    </div>
                  </>
                ) : (
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#0f5132' }}>Explicador guiado: Sigue estos sencillos pasos para ingresar tu nombre sin problemas.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}><strong>PASO 1:</strong> Presiona una vez sobre la casilla de texto.</div>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}><strong>PASO 2:</strong> Escribe tu nombre completo usando el teclado.</div>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}><strong>PASO 3:</strong> Presiona el botón verde Continuar.</div>
                    </div>
                    <IonButton fill="clear" onClick={() => setMostrarGuia(false)}>Cerrar explicación y escribir</IonButton>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {etapa === 2 && (
            <IonCard style={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <IonCardContent>
                <h2 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Haz esto para continuar</h2>
                
                {!mostrarGuia ? (
                  <>
                    <IonItem lines="none" style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '14px' }}>
                      <IonLabel position="stacked" style={{ fontWeight: 'bold', color: '#333' }}>Correo electrónico</IonLabel>
                      <IonInput type="email" value={email} placeholder="Ej: nombre@correo.cl" onIonInput={(e) => setEmail(e.detail.value ?? '')} />
                    </IonItem>
                    
                    <IonItem lines="none" style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '14px' }}>
                      <IonLabel position="stacked" style={{ fontWeight: 'bold', color: '#333' }}>Contraseña (mínimo 8 caracteres)</IonLabel>
                      <IonInput type="password" value={password} placeholder="Crea una contraseña segura" onIonInput={(e) => setPassword(e.detail.value ?? '')} />
                    </IonItem>
                    
                    <IonItem lines="none" style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
                      <IonLabel position="stacked" style={{ fontWeight: 'bold', color: '#333' }}>Confirmar contraseña</IonLabel>
                      <IonInput type="password" value={confirmPassword} placeholder="Repite tu contraseña aquí" onIonInput={(e) => setConfirmPassword(e.detail.value ?? '')} />
                    </IonItem>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonButton fill="outline" onClick={() => setMostrarGuia(true)} style={{ '--border-radius': '10px' }}>
                        <IonIcon slot="start" icon={syncOutline} /> Ver explicación guiada
                      </IonButton>
                      <IonButton onClick={validarCredenciales} disabled={enviando} style={{ '--background': '#0f5132', '--border-radius': '20px', minWidth: '150px' }}>
                        {enviando ? 'Creando cuenta...' : 'Continuar'} <IonIcon slot="end" icon={arrowForwardOutline} />
                      </IonButton>
                    </div>
                  </>
                ) : (
                  /* Explicador guiado Diapo 7 */
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#0f5132' }}>
                      Explicador guiado: Sigue estos sencillos pasos para ingresar tu correo y crear tu contraseña sin problemas.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <strong>PASO 1:</strong> Presiona sobre la primera casilla y escribe tu correo completo.
                      </div>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <strong>PASO 2:</strong> Presiona la segunda casilla e inventa una contraseña (mínimo 8 caracteres).
                      </div>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <strong>PASO 3:</strong> Presiona la última casilla y repite exactamente la misma contraseña para confirmarla.
                      </div>
                      <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <strong>PASO 4:</strong> Presiona el botón verde Continuar.
                      </div>
                    </div>
                    <IonButton fill="clear" onClick={() => setMostrarGuia(false)}>
                      Cerrar explicación y escribir
                    </IonButton>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {etapa === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '72px', color: '#0f5132' }} />
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', margin: '16px 0' }}>¡Felicidades!</h1>
              <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '30px' }}>Tu cuenta ha sido creada exitosamente. Ahora practica con nosotros.</p>
              <IonButton routerLink="/inicio" style={{ '--background': '#0f5132', '--border-radius': '25px', minWidth: '220px', height: '48px' }}>
                Continuar <IonIcon slot="end" icon={arrowForwardOutline} />
              </IonButton>
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Registro;
