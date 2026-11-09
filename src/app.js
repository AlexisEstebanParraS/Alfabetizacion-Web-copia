import 'dotenv/config'; // Primera línea: carga el .env antes de importar el resto
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { probarConexion } from './config/db.js';

// Importar rutas
import authRutas from './routes/auth_rutas.js';
import modulosRutas from './routes/modulos_rutas.js';
import progresoRutas from './routes/progreso_rutas.js';
import adminRoutes from './routes/admin_rutas.js';

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
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'API Municipio Fácil operativa' });
});
app.use('/api/auth', authRutas);

// Endpoints protegidos: cada router exige el JWT (Authorization: Bearer <TOKEN>)
app.use('/api/modulos', modulosRutas);
app.use('/api/progreso', progresoRutas);
app.use('/api/admin', adminRoutes);

// Manejo de errores
app.use(rutaNoEncontrada);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

export default app;
