import { pool } from '../config/db.js';

// Capa de servicios: aquí vive el SQL de autenticación.
// El controlador solo maneja la petición HTTP y la respuesta.

export const crearUsuario = async ({ nombre, email, passwordHash, telefono, rolId }) => {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, telefono, rol_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, email, telefono, rol_id, creado_en`,
    [nombre, email, passwordHash, telefono, rolId]
  );
  return rows[0];
};

export const buscarUsuarioActivoPorEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, telefono, rol_id, activo, creado_en, password_hash
       FROM usuarios
      WHERE email = $1 AND activo = TRUE`,
    [email]
  );
  return rows[0] ?? null;
};
