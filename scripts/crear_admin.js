// Crea (o asciende) el primer administrador usando los datos del .env:
//   ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD
// Uso: npm run crear-admin
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';
import { validarEmail, validarPassword } from '../src/util/validacion.js';

const ROL_ADMIN = 2;
const { ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

const main = async () => {
  if (!ADMIN_NOMBRE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Define ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD en el .env');
  }
  validarEmail(ADMIN_EMAIL);
  validarPassword(ADMIN_PASSWORD);

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Si el correo ya existe, se actualiza su rol y contraseña; si no, se crea
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET rol_id = EXCLUDED.rol_id, password_hash = EXCLUDED.password_hash, activo = TRUE
     RETURNING id, email, (xmax = 0) AS creado`,
    [ADMIN_NOMBRE.trim(), email, hash, ROL_ADMIN]
  );
  const { id, creado } = rows[0];
  console.log(`✅ Administrador ${creado ? 'creado' : 'actualizado'}: ${email} (id ${id})`);
  console.log('   Recomendación: borra ADMIN_PASSWORD del .env después de este paso.');
};

main()
  .catch((error) => {
    console.error('❌ No se pudo crear el administrador:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
