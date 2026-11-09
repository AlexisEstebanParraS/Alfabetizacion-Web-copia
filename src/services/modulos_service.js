import { pool } from '../config/db.js';

// Columnas que se devuelven (en vez de SELECT *): solo lo que el frontend necesita
const COLUMNAS = 'id, titulo, descripcion, dificultad, total_pasos, estado, creado_por, creado_en';

/**
 * Lista módulos con filtros opcionales y paginación opcional (LIMIT/OFFSET).
 * Los valores externos siempre viajan como parámetros ($1, $2...), nunca concatenados en el SQL.
 */
export const listarModulos = async ({ soloHabilitados, estado, dificultad, paginacion }) => {
  const filtros = [];
  const valores = [];

  if (soloHabilitados) {
    filtros.push(`estado = 'Habilitado'`);
  } else if (estado) {
    valores.push(estado);
    filtros.push(`estado = $${valores.length}`);
  }
  if (dificultad) {
    valores.push(dificultad);
    filtros.push(`dificultad = $${valores.length}`);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  // Total de registros que cumplen los filtros (para saber cuántas páginas hay)
  const conteo = await pool.query(`SELECT COUNT(*) AS total FROM modulos_tutoriales ${where}`, valores);

  let limite = '';
  const valoresPagina = [...valores];
  if (paginacion) {
    valoresPagina.push(paginacion.limit, paginacion.offset);
    limite = `LIMIT $${valoresPagina.length - 1} OFFSET $${valoresPagina.length}`;
  }

  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM modulos_tutoriales ${where} ORDER BY id ${limite}`,
    valoresPagina
  );

  return { total: Number(conteo.rows[0].total), modulos: rows };
};

export const obtenerModulo = async (id, soloHabilitados) => {
  const condicion = soloHabilitados ? `AND estado = 'Habilitado'` : '';
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM modulos_tutoriales WHERE id = $1 ${condicion}`,
    [id]
  );
  return rows[0] ?? null;
};

export const crearModulo = async ({ titulo, descripcion, dificultad, total_pasos, estado }, creadoPor) => {
  const { rows } = await pool.query(
    `INSERT INTO modulos_tutoriales (titulo, descripcion, dificultad, total_pasos, estado, creado_por)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNAS}`,
    [titulo, descripcion, dificultad, total_pasos, estado, creadoPor]
  );
  return rows[0];
};

export const reemplazarModulo = async (id, { titulo, descripcion, dificultad, total_pasos, estado }) => {
  const { rows } = await pool.query(
    `UPDATE modulos_tutoriales
        SET titulo = $1, descripcion = $2, dificultad = $3, total_pasos = $4, estado = $5
      WHERE id = $6 RETURNING ${COLUMNAS}`,
    [titulo, descripcion, dificultad, total_pasos, estado, id]
  );
  return rows[0] ?? null;
};

/** campos: objeto con solo las columnas permitidas que se van a cambiar. */
export const modificarModulo = async (id, campos) => {
  const columnas = Object.keys(campos);
  const sets = columnas.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE modulos_tutoriales SET ${sets} WHERE id = $${columnas.length + 1} RETURNING ${COLUMNAS}`,
    [...Object.values(campos), id]
  );
  return rows[0] ?? null;
};

export const eliminarModulo = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM modulos_tutoriales WHERE id = $1 RETURNING ${COLUMNAS}`,
    [id]
  );
  return rows[0] ?? null;
};
