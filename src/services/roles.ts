// Roles del sistema (deben coincidir con la tabla "roles" de database.sql)
export const ROL_CIUDADANO = 1;
export const ROL_ADMIN = 2;

/** Ruta de inicio según el rol del usuario. */
export const rutaInicioPorRol = (rolId: number): string =>
  rolId === ROL_ADMIN ? '/admin/panel' : '/inicio';
