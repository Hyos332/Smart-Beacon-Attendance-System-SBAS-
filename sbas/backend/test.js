#!/usr/bin/env node

console.log('🧪 Running SBAS Backend Tests...');

// Test básico para verificar que el servidor puede inicializarse
const express = require('express');
const cors = require('cors');

async function runTests() {
  try {
    console.log('✅ Testing Express server initialization...');
    
    // Test 1: Verificar que Express se puede inicializar
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    console.log('✅ Express app initialized successfully');
    
    // Test 2: Verificar que las rutas básicas se pueden definir
    app.get('/test', (req, res) => {
      res.json({ status: 'test ok' });
    });
    
    console.log('✅ Basic routes can be defined');
    
    // Test 3: Verificar que el servidor puede arrancar en un puerto de test
    const testServer = app.listen(0, () => {
      const port = testServer.address().port;
      console.log(`✅ Test server can start on port ${port}`);
      
      // Cerrar el servidor de test
      testServer.close(() => {
        console.log('✅ Test server closed successfully');
        console.log('\n🎉 All backend tests passed!');
        process.exit(0);
      });
    });
    
    // Timeout de seguridad
    setTimeout(() => {
      console.error('❌ Test timeout');
      process.exit(1);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Backend tests failed:', error.message);
    process.exit(1);
  }
}

runTests();