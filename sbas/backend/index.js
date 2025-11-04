const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'attendance.json');

// Asegurar que existe el directorio data
const ensureDataDir = async () => {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify({ classes: {}, attendance: [] }));
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// CORS corregido con tus URLs exactas
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://frontend-dakoskqbv-hyos332s-projects.vercel.app',
    'https://webapp-student-38xxjxjbi-hyos332s-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

let beaconStatus = { active: false, class_date: null };

// Funciones helper
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { classes: {}, attendance: [] };
  }
};

const writeData = async (data) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

// ✅ ENDPOINTS ESENCIALES RESTAURADOS

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Beacon status
app.get('/api/beacon/status', (req, res) => {
  res.json(beaconStatus);
});

// Start beacon/class
app.post('/api/beacon/start', async (req, res) => {
  const { class_date } = req.body;
  if (!class_date) {
    return res.status(400).json({ error: 'class_date es requerido' });
  }
  
  beaconStatus = { active: true, class_date };
  console.log(`🟢 Clase iniciada: ${class_date}`);
  res.json({ success: true, message: 'Clase iniciada', class_date });
});

// Stop beacon/class
app.post('/api/beacon/stop', (req, res) => {
  const previousDate = beaconStatus.class_date;
  beaconStatus = { active: false, class_date: null };
  console.log(`🔴 Clase finalizada: ${previousDate}`);
  res.json({ success: true, message: 'Clase finalizada' });
});

// Get attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const { class_date } = req.query;
    const data = await readData();
    
    if (class_date) {
      const classAttendance = data.attendance.filter(record => 
        record.class_date === class_date
      );
      res.json(classAttendance);
    } else {
      res.json(data.attendance);
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Register attendance
app.post('/api/attendance/register', async (req, res) => {
  try {
    const { student_id, method = 'Manual' } = req.body;
    
    if (!student_id) {
      return res.status(400).json({ error: 'student_id es requerido' });
    }
    
    if (!beaconStatus.active) {
      return res.status(400).json({ error: 'No hay clase activa' });
    }
    
    const data = await readData();
    
    // Verificar duplicados
    const existing = data.attendance.find(record => 
      record.student_id === student_id && record.class_date === beaconStatus.class_date
    );
    
    if (existing) {
      return res.status(409).json({ error: 'Ya registraste asistencia para esta clase' });
    }
    
    // Crear nuevo registro
    const newRecord = {
      id: Date.now(),
      student_id,
      class_date: beaconStatus.class_date,
      timestamp: new Date().toISOString(),
      detection_method: method
    };
    
    data.attendance.push(newRecord);
    await writeData(data);
    
    console.log(`✅ Asistencia registrada: ${student_id} - ${beaconStatus.class_date}`);
    res.json({ success: true, class_date: beaconStatus.class_date });
    
  } catch (error) {
    console.error('Error registering attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Check existing attendance
app.get('/api/attendance/check', async (req, res) => {
  try {
    const { student_id } = req.query;
    
    if (!student_id) {
      return res.status(400).json({ error: 'student_id es requerido' });
    }
    
    const data = await readData();
    const hasAttendance = data.attendance.some(record => 
      record.student_id === student_id && record.class_date === beaconStatus.class_date
    );
    
    res.json({ 
      hasAttendance, 
      activeClass: beaconStatus.active ? beaconStatus.class_date : null 
    });
  } catch (error) {
    console.error('Error checking attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Delete single attendance
app.delete('/api/attendance/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    
    const initialLength = data.attendance.length;
    data.attendance = data.attendance.filter(record => record.id !== parseInt(id));
    
    if (data.attendance.length === initialLength) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    await writeData(data);
    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Clear all attendance for date
app.delete('/api/attendance/clear', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Fecha es requerida' });
    }
    
    const data = await readData();
    const initialLength = data.attendance.length;
    data.attendance = data.attendance.filter(record => record.class_date !== date);
    
    const deletedCount = initialLength - data.attendance.length;
    await writeData(data);
    
    res.json({ message: `${deletedCount} registros eliminados` });
  } catch (error) {
    console.error('Error clearing attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Initialize and start server
ensureDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SBAS Backend funcionando en puerto ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
});