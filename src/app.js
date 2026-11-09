import 'dotenv/config'; // Primera línea: carga el .env antes de importar el resto
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool, probarConexion } from './config/db.js';

// Importar rutas
import authRutas from './routes/auth_rutas.js';
import modulosRutas from './routes/modulos_rutas.js';
import progresoRutas from './routes/progreso_rutas.js';
import adminRoutes from './routes/admin_rutas.js';
import usuariosRutas from './routes/usuarios_rutas.js';

// Importar middlewares de error
import { rutaNoEncontrada, errorHandler } from './middlewares/error.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Cabeceras de seguridad (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
// y se oculta "X-Powered-By: Express"
app.use(helmet());

// CORS: solo el origen del frontend puede leer las respuestas desde el navegador.
// Un origen = protocolo + host + puerto. En desarrollo React/Ionic corre en localhost:5173;
// con Docker el frontend queda en localhost:8080 (se configura con FRONTEND_ORIGIN).
const origenFrontend = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(cors({
  origin: origenFrontend,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Interpreta los cuerpos JSON y los deja en req.body
app.use(express.json());

// Probar conexión a la BD
probarConexion();

// Endpoints públicos
// Health: comprueba que la API y la base de datos responden (503 si la base de datos no está disponible)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ ok: true, message: 'API Municipio Fácil operativa', db: 'ok' });
  } catch {
    res.status(503).json({ ok: false, error: { mensaje: 'Base de datos no disponible' } });
  }
});
app.use('/api/auth', authRutas);

// Endpoints protegidos: cada router exige el JWT (Authorization: Bearer <TOKEN>)
app.use('/api/modulos', modulosRutas);
app.use('/api/progreso', progresoRutas);
app.use('/api/admin', adminRoutes);
app.use('/api/usuarios', usuariosRutas);

// Manejo de errores
app.use(rutaNoEncontrada);
app.use(errorHandler);

// 0.0.0.0: escucha en todas las interfaces, necesario para recibir conexiones dentro de Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

export default app;
