const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { startBeacon, stopBeacon, isBeaconActive } = require('./beacon');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Patrones permitidos
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/frontend-[a-z0-9]+-hyos332s-projects\.vercel\.app$/,
      /^https:\/\/webapp-student-[a-z0-9]+-hyos332s-projects\.vercel\.app$/
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    callback(null, isAllowed);
  },
  credentials: true
}));
app.use(express.json());

// Variables de estado
let activeClassDate = null;
let attendanceRecords = [];

// Archivo de datos
const dataFile = path.join(__dirname, 'data', 'attendance.json');

// Inicializar datos
const initData = async () => {
  try {
    // Crear directorio si no existe
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    
    // Cargar datos existentes
    try {
      const data = await fs.readFile(dataFile, 'utf8');
      attendanceRecords = JSON.parse(data);
      console.log(`✅ Loaded ${attendanceRecords.length} existing records`);
    } catch (error) {
      // Archivo no existe, crear uno vacío
      attendanceRecords = [];
      await saveData();
      console.log('✅ Created new attendance data file');
    }
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    attendanceRecords = [];
  }
};

// Guardar datos
const saveData = async () => {
  try {
    await fs.writeFile(dataFile, JSON.stringify(attendanceRecords, null, 2));
  } catch (error) {
    console.error('❌ Error saving data:', error);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    records: attendanceRecords.length,
    beacon: isBeaconActive() ? 'active' : 'inactive'
  });
});

// Beacon status
app.get('/api/beacon/status', (req, res) => {
  const { getBeaconInfo } = require('./beacon');
  const info = getBeaconInfo();
  
  res.json({
    active: info.active,
    class_date: activeClassDate,
    mode: info.mode,
    uuid: info.uuid,
    bleAvailable: info.bleAvailable
  });
});

// Start beacon
app.post('/api/beacon/start', async (req, res) => {
  try {
    const { class_date } = req.body;
    
    if (!class_date) {
      return res.status(400).json({ error: 'class_date is required' });
    }
    
    activeClassDate = class_date;
    
    // Iniciar beacon (real o simulado según BEACON_MODE)
    startBeacon();
    
    console.log(`[BACKEND] Beacon iniciado para clase: ${class_date}`);
    res.json({ 
      message: 'Beacon iniciado correctamente',
      active: true,
      class_date,
      mode: process.env.BEACON_MODE || 'simulate'
    });
  } catch (error) {
    console.error('Error starting beacon:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Stop beacon
app.post('/api/beacon/stop', async (req, res) => {
  try {
    stopBeacon();
    activeClassDate = null;
    
    console.log('[BACKEND] Beacon detenido');
    res.json({ 
      message: 'Beacon detenido correctamente',
      active: false,
      mode: process.env.BEACON_MODE || 'simulate'
    });
  } catch (error) {
    console.error('Error stopping beacon:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get attendance
app.get('/api/attendance', (req, res) => {
  const { date, class_date } = req.query;
  const dateToFilter = class_date || date;
  
  console.log(`📊 Fetching attendance for date: ${dateToFilter}`);
  
  let filteredRecords = attendanceRecords;
  
  if (dateToFilter) {
    filteredRecords = attendanceRecords.filter(record => 
      record.class_date === dateToFilter
    );
  }
  
  // Ordenar por timestamp descendente
  filteredRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  console.log(`📊 Found ${filteredRecords.length} records`);
  res.json(filteredRecords);
});

// Register attendance
app.post('/api/attendance/register', (req, res) => {
  const { student_id, method = 'BLE' } = req.body;
  
  if (!isBeaconActive()) {
    return res.status(400).json({ error: 'Beacon is not active' });
  }
  
  console.log(`📝 Registering attendance: ${student_id} via ${method}`);
  
  const newRecord = {
    id: Date.now() + Math.random(), // ID único
    student_id,
    timestamp: new Date().toISOString(),
    detection_method: method,
    class_date: activeClassDate
  };
  
  attendanceRecords.push(newRecord);
  
  // Guardar datos de forma asíncrona
  saveData().catch(console.error);
  
  console.log(`✅ Attendance registered for ${student_id}`);
  res.json({ 
    message: 'Attendance registered successfully',
    id: newRecord.id
  });
});

// Delete single record
app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  const recordId = parseFloat(id);
  
  console.log(`🗑️ Deleting record ID: ${id}`);
  
  const initialLength = attendanceRecords.length;
  attendanceRecords = attendanceRecords.filter(record => record.id !== recordId);
  
  if (attendanceRecords.length === initialLength) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }
  
  // Guardar datos
  saveData().catch(console.error);
  
  console.log(`✅ Deleted record ID: ${id}`);
  res.json({ message: 'Registro eliminado exitosamente' });
});

// Delete multiple records
app.delete('/api/attendance/delete-multiple', (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Lista de IDs requerida' });
  }
  
  console.log(`🗑️ Deleting multiple records:`, ids);
  
  const idsToDelete = ids.map(id => parseFloat(id));
  const initialLength = attendanceRecords.length;
  
  attendanceRecords = attendanceRecords.filter(record => 
    !idsToDelete.includes(record.id)
  );
  
  const deletedCount = initialLength - attendanceRecords.length;
  
  // Guardar datos
  saveData().catch(console.error);
  
  console.log(`✅ Deleted ${deletedCount} of ${ids.length} records`);
  res.json({
    message: `Se eliminaron ${deletedCount} de ${ids.length} registros`,
    deleted_count: deletedCount
  });
});

// Clear all records for date
app.delete('/api/attendance/clear', (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Fecha requerida' });
  }
  
  console.log(`🗑️ Clearing all records for date: ${date}`);
  
  const initialLength = attendanceRecords.length;
  attendanceRecords = attendanceRecords.filter(record => 
    record.class_date !== date
  );
  
  const deletedCount = initialLength - attendanceRecords.length;
  
  // Guardar datos
  saveData().catch(console.error);
  
  console.log(`✅ Cleared ${deletedCount} records for date ${date}`);
  res.json({
    message: `Se eliminaron ${deletedCount} registros de la fecha ${date}`,
    deleted_count: deletedCount
  });
});

// Inicializar datos y arrancar servidor
const startServer = async () => {
  await initData();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Records loaded: ${attendanceRecords.length}`);
  });
};

// Manejar cierre limpio
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await saveData();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  await saveData();
  process.exit(0);
});

startServer().catch(console.error);