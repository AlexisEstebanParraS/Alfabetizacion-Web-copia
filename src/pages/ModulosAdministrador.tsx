import React, { useEffect, useState } from 'react';
import {
  IonButton, IonInput, IonItem, IonLabel, IonModal, IonSelect,
  IonSelectOption, IonSpinner, IonTextarea, useIonAlert,
} from '@ionic/react';
import AdministracionLayout from '../components/AdministracionLayout';
import Aviso, { type MensajeAviso } from '../components/Aviso';
import {
  cambiarEstadoModulo, eliminarModulo, guardarModulo, obtenerModulos,
  type ModuloAdministracion,
} from '../services/administracion';
import './VistasAdministrador.css';

const moduloVacio: Omit<ModuloAdministracion, 'id'> = {
  titulo: '',
  descripcion: '',
  dificultad: 'Facil',
  total_pasos: 3,
  estado: 'Habilitado',
};

const ModulosAdministrador: React.FC = () => {
  const [modulos, setModulos] = useState<ModuloAdministracion[]>([]);
  const [moduloEditado, setModuloEditado] = useState<ModuloAdministracion | null>(null);
  const [formulario, setFormulario] = useState(moduloVacio);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<MensajeAviso | null>(null);
  const [error, setError] = useState('');

  const cargarModulos = async () => {
    setCargando(true);
    setError('');
    try {
      setModulos(await obtenerModulos());
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudieron cargar los módulos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarModulos();
  }, []);

  const abrirNuevoModulo = () => {
    setModuloEditado(null);
    setFormulario(moduloVacio);
    setError('');
    setModalAbierto(true);
  };

  const abrirEdicion = (modulo: ModuloAdministracion) => {
    setModuloEditado(modulo);
    setFormulario({
      titulo: modulo.titulo,
      descripcion: modulo.descripcion,
      dificultad: modulo.dificultad,
      total_pasos: modulo.total_pasos,
      estado: modulo.estado,
    });
    setError('');
    setModalAbierto(true);
  };

  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await guardarModulo(formulario, moduloEditado?.id);
      setModalAbierto(false);
      setAviso({ tipo: 'exito', texto: moduloEditado ? 'Módulo actualizado.' : 'Módulo creado.' });
      await cargarModulos();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo guardar el módulo.');
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstado = async (modulo: ModuloAdministracion) => {
    const nuevoEstado = modulo.estado === 'Habilitado' ? 'Deshabilitado' : 'Habilitado';
    setError('');
    try {
      await cambiarEstadoModulo(modulo.id, nuevoEstado);
      setAviso({ tipo: 'exito', texto: `"${modulo.titulo}" quedó ${nuevoEstado.toLowerCase()}.` });
      await cargarModulos();
    } catch (causa) {
      setAviso({ tipo: 'error', texto: causa instanceof Error ? causa.message : 'No se pudo cambiar el estado del módulo.' });
    }
  };

  const [mostrarAlerta] = useIonAlert();

  // Eliminar es irreversible y borra el progreso de los ciudadanos: se pide confirmación
  const confirmarEliminacion = (modulo: ModuloAdministracion) => {
    void mostrarAlerta({
      header: 'Eliminar módulo',
      message: `Se eliminará "${modulo.titulo}" y el progreso de todos los ciudadanos en este módulo. Esta acción no se puede deshacer. Si solo quieres ocultarlo, usa "Deshabilitar".`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void (async () => {
              setError('');
              try {
                await eliminarModulo(modulo.id);
                setAviso({ tipo: 'exito', texto: `Se eliminó "${modulo.titulo}".` });
                await cargarModulos();
              } catch (causa) {
                setAviso({ tipo: 'error', texto: causa instanceof Error ? causa.message : 'No se pudo eliminar el módulo.' });
              }
            })();
          },
        },
      ],
    });
  };

  const habilitados = modulos.filter((modulo) => modulo.estado === 'Habilitado').length;
  const borradores = modulos.filter((modulo) => modulo.estado === 'Borrador').length;
  const deshabilitados = modulos.filter((modulo) => modulo.estado === 'Deshabilitado').length;

  return (
    <AdministracionLayout titulo="Contenidos y tutoriales">
      <div className="admin-page-heading-row">
        <div>
          <p className="admin-overline">CONTENIDO DE APRENDIZAJE</p>
          <h1 className="admin-page-title">Gestión de módulos</h1>
          <p className="admin-page-description">Crea y actualiza los tutoriales que aparecen en las prácticas ciudadanas.</p>
        </div>
        <IonButton onClick={abrirNuevoModulo}>Crear módulo</IonButton>
      </div>

      {error && !modalAbierto && <div className="admin-alert" role="alert">{error}</div>}

      <section className="admin-metric-grid admin-module-summary" aria-label="Resumen de módulos">
        <MetricCard titulo="Módulos totales" valor={modulos.length} />
        <MetricCard titulo="Habilitados" valor={habilitados} />
        <MetricCard titulo="Borradores" valor={borradores} />
        <MetricCard titulo="Deshabilitados" valor={deshabilitados} />
      </section>

      <section className="admin-section-card admin-table-card">
        {cargando ? (
          <div className="admin-loading"><IonSpinner name="crescent" /> Cargando módulos…</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr><th>Módulo</th><th>Pasos</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {modulos.map((modulo) => (
                  <tr key={modulo.id}>
                    <td>
                      <strong>{modulo.titulo}</strong>
                      <small className="admin-table-secondary">{modulo.descripcion}</small>
                    </td>
                    <td>{modulo.total_pasos}</td>
                    <td><span className={`admin-status admin-status-${modulo.estado.toLowerCase()}`}>{modulo.estado}</span></td>
                    <td className="admin-module-actions">
                      <IonButton size="small" fill="outline" onClick={() => abrirEdicion(modulo)}>Modificar</IonButton>
                      <IonButton
                        size="small"
                        fill="outline"
                        color={modulo.estado === 'Habilitado' ? 'danger' : 'success'}
                        onClick={() => void alternarEstado(modulo)}
                      >
                        {modulo.estado === 'Habilitado' ? 'Deshabilitar' : 'Habilitar'}
                      </IonButton>
                      <IonButton size="small" fill="clear" color="danger" onClick={() => confirmarEliminacion(modulo)}>
                        Eliminar
                      </IonButton>
                    </td>
                  </tr>
                ))}
                {modulos.length === 0 && <tr><td colSpan={4} className="admin-empty-cell">No hay módulos registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <IonModal isOpen={modalAbierto} onDidDismiss={() => setModalAbierto(false)}>
        <div className="admin-modal-content">
          <h2>{moduloEditado ? 'Modificar módulo' : 'Crear módulo'}</h2>
          {error && <div className="admin-alert" role="alert">{error}</div>}
          <form onSubmit={(evento) => void guardar(evento)}>
            <IonItem>
              <IonLabel position="stacked">Nombre del módulo</IonLabel>
              <IonInput
                required
                maxlength={150}
                value={formulario.titulo}
                onIonInput={(evento) => setFormulario((actual) => ({ ...actual, titulo: evento.detail.value ?? '' }))}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Descripción</IonLabel>
              <IonTextarea
                required
                autoGrow
                value={formulario.descripcion}
                onIonInput={(evento) => setFormulario((actual) => ({ ...actual, descripcion: evento.detail.value ?? '' }))}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Dificultad</IonLabel>
              <IonSelect
                value={formulario.dificultad}
                onIonChange={(evento) => setFormulario((actual) => ({ ...actual, dificultad: evento.detail.value }))}
              >
                <IonSelectOption value="Facil">Fácil</IonSelectOption>
                <IonSelectOption value="Media">Media</IonSelectOption>
                <IonSelectOption value="Alta">Alta</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Cantidad de pasos</IonLabel>
              <IonInput
                type="number"
                min={1}
                required
                value={formulario.total_pasos}
                onIonInput={(evento) => setFormulario((actual) => ({
                  ...actual,
                  total_pasos: Number(evento.detail.value) || 1,
                }))}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Estado</IonLabel>
              <IonSelect
                value={formulario.estado}
                onIonChange={(evento) => setFormulario((actual) => ({ ...actual, estado: evento.detail.value }))}
              >
                <IonSelectOption value="Habilitado">Habilitado</IonSelectOption>
                <IonSelectOption value="Borrador">Borrador</IonSelectOption>
                <IonSelectOption value="Deshabilitado">Deshabilitado</IonSelectOption>
              </IonSelect>
            </IonItem>
            <div className="admin-modal-actions">
              <IonButton fill="outline" onClick={() => setModalAbierto(false)} disabled={guardando}>Cancelar</IonButton>
              <IonButton type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar cambios'}
              </IonButton>
            </div>
          </form>
        </div>
      </IonModal>
      <Aviso aviso={aviso} alCerrar={() => setAviso(null)} />
    </AdministracionLayout>
  );
};

const MetricCard: React.FC<{ titulo: string; valor: number }> = ({ titulo, valor }) => (
  <div className="admin-section-card admin-metric-card">
    <p>{titulo}</p>
    <strong>{valor}</strong>
  </div>
);

export default ModulosAdministrador;
