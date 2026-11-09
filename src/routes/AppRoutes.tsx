import React from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import MenuLateral from '../components/MenuLateral';
import Bienvenida from '../pages/Bienvenida';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Inicio from '../pages/Inicio';
import Practicar from '../pages/Practicar';
import Leccion from '../pages/Leccion';
import MiPerfil from '../pages/MiPerfil';
import Configuracion from '../pages/Configuracion';
import Ayuda from '../pages/Ayuda';
import PanelAdministrador from '../pages/PanelAdministrador';
import UsuariosAdministrador from '../pages/UsuariosAdministrador';
import MetricasAdministrador from '../pages/MetricasAdministrador';
import ModulosAdministrador from '../pages/ModulosAdministrador';
import ConfiguracionAdministrador from '../pages/ConfiguracionAdministrador';
import ProtectedRoute from './ProtectedRoute';
import { obtenerSesion } from '../services/autenticacion';
import { ROL_ADMIN, ROL_CIUDADANO } from '../services/roles';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const sesion = obtenerSesion();
  const rutasSinMenu = ['/', '/bienvenida', '/iniciar-sesion', '/admin/iniciar-sesion', '/registro', '/ayuda'];
  const mostrarMenu = Boolean(sesion)
    && !rutasSinMenu.includes(location.pathname)
    && !location.pathname.startsWith('/admin');

  return (
    <IonSplitPane contentId="main-content">
      {mostrarMenu && <MenuLateral />}
      <IonRouterOutlet id="main-content">
        <Route path="/bienvenida" element={<Bienvenida />} />
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/admin/iniciar-sesion" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/ayuda" element={<Ayuda />} />

        <Route path="/inicio" element={
          <ProtectedRoute allowedRoles={[ROL_CIUDADANO]}><Inicio /></ProtectedRoute>
        } />
        <Route path="/practicar" element={
          <ProtectedRoute allowedRoles={[ROL_CIUDADANO]}><Practicar /></ProtectedRoute>
        } />
        <Route path="/practicar/:moduloId" element={
          <ProtectedRoute allowedRoles={[ROL_CIUDADANO]}><Leccion /></ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute allowedRoles={[ROL_CIUDADANO]}><MiPerfil /></ProtectedRoute>
        } />
        <Route path="/configuracion" element={
          <ProtectedRoute allowedRoles={[ROL_CIUDADANO]}><Configuracion /></ProtectedRoute>
        } />
        <Route path="/admin/panel" element={
          <ProtectedRoute allowedRoles={[ROL_ADMIN]}><PanelAdministrador /></ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedRoute allowedRoles={[ROL_ADMIN]}><UsuariosAdministrador /></ProtectedRoute>
        } />
        <Route path="/admin/metricas" element={
          <ProtectedRoute allowedRoles={[ROL_ADMIN]}><MetricasAdministrador /></ProtectedRoute>
        } />
        <Route path="/admin/modulos" element={
          <ProtectedRoute allowedRoles={[ROL_ADMIN]}><ModulosAdministrador /></ProtectedRoute>
        } />
        <Route path="/admin/configuracion" element={
          <ProtectedRoute allowedRoles={[ROL_ADMIN]}><ConfiguracionAdministrador /></ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/bienvenida" replace />} />
        <Route path="*" element={<Navigate to="/bienvenida" replace />} />
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

export default AppRoutes;
