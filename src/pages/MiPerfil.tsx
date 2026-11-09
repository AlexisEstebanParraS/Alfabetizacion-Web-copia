import React, { useEffect, useState } from 'react';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem,
  IonLabel, IonList, IonNote, IonPage, IonSpinner, IonTitle, IonToolbar,
} from '@ionic/react';
import Aviso, { type MensajeAviso } from '../components/Aviso';
import { actualizarPerfil, obtenerPerfil, type Perfil } from '../services/perfil';

const TELEFONO_REGEX = /^\+?[0-9\s()-]{7,20}$/;

const MiPerfil: React.FC = () => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState<MensajeAviso | null>(null);

  // Carga los datos del perfil una vez, al entrar a la pantalla
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const datos = await obtenerPerfil();
        setPerfil(datos);
        setNombre(datos.nombre);
        setTelefono(datos.telefono ?? '');
      } catch (causa) {
        setError(causa instanceof Error ? causa.message : 'No se pudo cargar tu perfil.');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  const nombreInvalido = nombre.trim() === '' || nombre.trim().length > 100;
  const telefonoInvalido = telefono.trim() !== '' && !TELEFONO_REGEX.test(telefono.trim());

  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (nombreInvalido || telefonoInvalido) return;
    setGuardando(true);
    setError('');
    try {
      const actualizado = await actualizarPerfil({ nombre: nombre.trim(), telefono: telefono.trim() });
      setPerfil(actualizado);
      setAviso({ tipo: 'exito', texto: 'Tus datos se guardaron correctamente.' });
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudieron guardar tus datos.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start"><IonBackButton defaultHref="/inicio" text="Inicio" /></IonButtons>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Mis datos</h1>

        {cargando && <IonSpinner name="crescent" aria-label="Cargando perfil" />}
        {error && <p role="alert" style={{ color: 'var(--ion-color-danger)' }}>{error}</p>}

        {!cargando && perfil && (
          <form onSubmit={(e) => void guardar(e)} noValidate>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Nombre (obligatorio)</IonLabel>
                <IonInput value={nombre} maxlength={100} onIonInput={(e) => setNombre(e.detail.value ?? '')} />
                {nombreInvalido && <IonNote color="danger">Escribe tu nombre (máximo 100 caracteres).</IonNote>}
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Teléfono (opcional)</IonLabel>
                <IonInput
                  type="tel"
                  value={telefono}
                  placeholder="Ej: +56 9 1234 5678"
                  onIonInput={(e) => setTelefono(e.detail.value ?? '')}
                />
                {telefonoInvalido && <IonNote color="danger">Usa solo números, espacios, +, ( ) o -.</IonNote>}
              </IonItem>
              <IonItem>
                <IonLabel><strong>Correo electrónico</strong><p>{perfil.email}</p></IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel><strong>Miembro desde</strong><p>{new Date(perfil.creado_en).toLocaleDateString('es-CL')}</p></IonLabel>
              </IonItem>
            </IonList>
            <IonButton type="submit" expand="block" disabled={guardando || nombreInvalido || telefonoInvalido}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </IonButton>
          </form>
        )}
      <Aviso aviso={aviso} alCerrar={() => setAviso(null)} />
      </IonContent>
    </IonPage>
  );
};

export default MiPerfil;
