import { pool } from '../config/db.js';

const COLUMNAS = `p.id, p.usuario_id, p.modulo_id, p.completado, p.paso_actual,
                  p.errores_cometidos, p.tiempo_segundos, p.actualizado_en`;

/**
 * Todas las funciones reciben "usuarioId":
 *  - un número  -> solo se ve/modifica el progreso de ese usuario (ciudadano)
 *  - null       -> sin restricción de dueño (administrador)
 */
const filtroDueno = (usuarioId, valores) => {
  if (usuarioId === null) return '';
  valores.push(usuarioId);
  return ` AND p.usuario_id = $${valores.length}`;
};

export const listarProgreso = async (usuarioId) => {
  const valores = [];
  const dueno = filtroDueno(usuarioId, valores);
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}, m.titulo AS modulo_titulo, m.total_pasos
       FROM progreso_usuarios p
       JOIN modulos_tutoriales m ON m.id = p.modulo_id
      WHERE TRUE ${dueno}
      ORDER BY p.id`,
    valores
  );
  return rows;
};

export const obtenerProgreso = async (id, usuarioId) => {
  const valores = [id];
  const dueno = filtroDueno(usuarioId, valores);
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}, m.total_pasos
       FROM progreso_usuarios p
       JOIN modulos_tutoriales m ON m.id = p.modulo_id
      WHERE p.id = $1 ${dueno}`,
    valores
  );
  return rows[0] ?? null;
};

export const moduloHabilitado = async (moduloId) => {
  const { rows } = await pool.query(
    `SELECT id FROM modulos_tutoriales WHERE id = $1 AND estado = 'Habilitado'`,
    [moduloId]
  );
  return rows.length > 0;
};

export const crearProgreso = async (usuarioId, moduloId) => {
  const { rows } = await pool.query(
    `INSERT INTO progreso_usuarios AS p (usuario_id, modulo_id)
     VALUES ($1, $2)
     RETURNING ${COLUMNAS}`,
    [usuarioId, moduloId]
  );
  return rows[0];
};

/** campos: columnas ya validadas que se van a cambiar. */
export const actualizarProgreso = async (id, usuarioId, campos) => {
  const columnas = Object.keys(campos);
  const valores = Object.values(campos);
  const sets = [...columnas.map((c, i) => `${c} = $${i + 1}`), 'actualizado_en = CURRENT_TIMESTAMP'].join(', ');
  valores.push(id);
  const condicionId = `p.id = $${valores.length}`;
  const dueno = filtroDueno(usuarioId, valores);

  const { rows } = await pool.query(
    `UPDATE progreso_usuarios AS p SET ${sets}
      WHERE ${condicionId} ${dueno}
      RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0] ?? null;
};

export const eliminarProgreso = async (id, usuarioId) => {
  const valores = [id];
  const dueno = filtroDueno(usuarioId, valores);
  const { rows } = await pool.query(
    `DELETE FROM progreso_usuarios AS p WHERE p.id = $1 ${dueno} RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0] ?? null;
};
