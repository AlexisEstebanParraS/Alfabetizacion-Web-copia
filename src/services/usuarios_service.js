import { pool } from '../config/db.js';

const COLUMNAS = 'u.id, u.nombre, u.email, u.telefono, u.rol_id, r.nombre AS rol, u.creado_en';

export const obtenerPerfil = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM usuarios u JOIN roles r ON r.id = u.rol_id
      WHERE u.id = $1 AND u.activo = TRUE`,
    [id]
  );
  return rows[0] ?? null;
};

export const actualizarPerfil = async (id, { nombre, telefono }) => {
  const { rows } = await pool.query(
    `UPDATE usuarios AS u SET nombre = $1, telefono = $2
       FROM roles r
      WHERE u.id = $3 AND u.activo = TRUE AND r.id = u.rol_id
      RETURNING ${COLUMNAS}`,
    [nombre, telefono, id]
  );
  return rows[0] ?? null;
};
