import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { startBeacon, isBeaconActive } from './beacon';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db: Database;
let beaconStatus = { active: false, classDate: null };

// Inicializar base de datos
async function initDatabase() {
  db = await open({
    filename: './attendance.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      detection_method TEXT DEFAULT 'BLE'
    )
  `);
}

// RUTAS EXISTENTES
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM attendance';
    let params: any[] = [];

    if (date) {
      query += ' WHERE DATE(timestamp) = ?';
      params = [date];
    }

    query += ' ORDER BY timestamp DESC';
    
    const records = await db.all(query, params);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching attendance' });
  }
});

app.post('/api/attendance/register', async (req, res) => {
  try {
    const { student_id, method = 'BLE' } = req.body;

    if (!beaconStatus.active) {
      return res.status(400).json({ error: 'Beacon is not active' });
    }

    // Verificar si ya registró hoy
    const existing = await db.get(
      'SELECT id FROM attendance WHERE student_id = ? AND DATE(timestamp) = DATE(?)',
      [student_id, new Date().toISOString()]
    );

    if (existing) {
      return res.status(409).json({ error: 'Attendance already registered for today' });
    }

    await db.run(
      'INSERT INTO attendance (student_id, timestamp, detection_method) VALUES (?, ?, ?)',
      [student_id, new Date().toISOString(), method]
    );

    res.json({ message: 'Attendance registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering attendance' });
  }
});

app.get('/api/beacon/status', (req, res) => {
  res.json(beaconStatus);
});

app.post('/api/beacon/start', (req, res) => {
  const { class_date } = req.body;
  beaconStatus.active = true;
  beaconStatus.classDate = class_date || new Date().toISOString().split('T')[0];
  startBeacon();
  res.json({ message: 'Beacon started' });
});

app.post('/api/beacon/stop', (req, res) => {
  beaconStatus.active = false;
  beaconStatus.classDate = null;
  res.json({ message: 'Beacon stopped' });
});

// NUEVAS RUTAS PARA ELIMINAR
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM attendance WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

app.delete('/api/attendance/clear', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }

    const result = await db.run('DELETE FROM attendance WHERE DATE(timestamp) = ?', [date]);
    
    res.json({
      message: `Se eliminaron ${result.changes} registros de la fecha ${date}`,
      deleted_count: result.changes
    });
  } catch (error) {
    console.error('Error clearing records:', error);
    res.status(500).json({ error: 'Error al limpiar registros' });
  }
});

app.delete('/api/attendance/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Lista de IDs requerida' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const result = await db.run(`DELETE FROM attendance WHERE id IN (${placeholders})`, ids);
    
    res.json({
      message: `Se eliminaron ${result.changes} de ${ids.length} registros`,
      deleted_count: result.changes
    });
  } catch (error) {
    console.error('Error deleting multiple records:', error);
    res.status(500).json({ error: 'Error al eliminar registros múltiples' });
  }
});

// Iniciar servidor
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

startServer();