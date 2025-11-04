import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase, seedDatabase } from './database/prisma';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS optimizada
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://sbas-teacher.vercel.app',
    'https://sbas-student.vercel.app',
    /^https:\/\/sbas-teacher.*\.vercel\.app$/,
    /^https:\/\/sbas-student.*\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '2.0.0-typescript'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Beacon Attendance System - TypeScript API',
    version: '2.0.0',
    documentation: '/api/docs'
  });
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    
    // Inicializar datos de prueba en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor TypeScript iniciado en puerto ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⏹️  Recibida señal ${signal}, cerrando servidor...`);
      
      server.close(async () => {
        await disconnectDatabase();
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor solo si este archivo es ejecutado directamente
if (require.main === module) {
  startServer();
}

export default app;