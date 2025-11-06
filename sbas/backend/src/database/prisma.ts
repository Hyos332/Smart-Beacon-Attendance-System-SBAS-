import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern para Prisma Client
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Función para verificar la conexión
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada exitosamente');
    
    // Verificar que las tablas existen
    const userCount = await prisma.user.count();
    console.log(`📊 Usuarios registrados: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
};

// Función para desconectar
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Base de datos desconectada');
  } catch (error) {
    console.error('❌ Error desconectando la base de datos:', error);
  }
};

// Función para limpiar la base de datos (solo en desarrollo)
export const cleanDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('No se puede limpiar la base de datos en producción');
  }

  try {
    await prisma.attendance.deleteMany();
    await prisma.class.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
    throw error;
  }
};

// Función para crear datos de prueba
export const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('⏭️ Saltando seed en producción');
    return;
  }

  try {
    // Verificar si ya existen usuarios
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('📊 Base de datos ya contiene datos');
      return;
    }

    // Crear usuarios de prueba
    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@test.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
        firstName: 'Profesor',
        lastName: 'Demo',
        role: 'TEACHER'
      }
    });

    const student = await prisma.user.create({
      data: {
        email: 'student@test.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
        firstName: 'Estudiante',
        lastName: 'Demo',
        role: 'STUDENT',
        studentId: 'EST001'
      }
    });

    // Crear clase de TEO
    const teoClass = await prisma.class.create({
      data: {
        name: 'TEO - Teoría de Estructuras y Optimización',
        description: 'Clase de TEO con sistema de asistencia por beacon',
        beaconId: 'beacon-teo-2024',
        teacherId: teacher.id,
        isActive: false
      }
    });

    console.log('🌱 Base de datos inicializada con datos de prueba');
    console.log(`👨‍🏫 Profesor: teacher@test.com / password`);
    console.log(`👨‍🎓 Estudiante: student@test.com / password`);
    console.log(`📚 Clase: ${teoClass.name}`);

  } catch (error) {
    console.error('❌ Error inicializando datos de prueba:', error);
    throw error;
  }
};

export default prisma;