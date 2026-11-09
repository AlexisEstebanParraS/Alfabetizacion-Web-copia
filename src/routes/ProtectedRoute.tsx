import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { obtenerSesion } from '../services/autenticacion';
import { rutaInicioPorRol } from '../services/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const sesion = obtenerSesion();

  if (!sesion) {
    return <Navigate to="/iniciar-sesion" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(sesion.usuario.rol_id)) {
    return <Navigate to={rutaInicioPorRol(sesion.usuario.rol_id)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
