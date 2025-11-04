// SBAS Backend - Sistema Unificado TypeScript
// Este archivo reemplaza el sistema anterior y usa la arquitectura moderna

console.log('🚀 Iniciando SBAS Backend con arquitectura TypeScript...');

// Verificar si estamos en producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // En producción, usar el JavaScript compilado
  console.log('📦 Modo producción: usando dist/index.js');
  require('./dist/index.js');
} else {
  // En desarrollo, usar ts-node para ejecutar TypeScript directamente
  console.log('⚡ Modo desarrollo: usando TypeScript con ts-node');
  require('ts-node/register');
  require('./src/index.ts');
}
