const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./attendance.db');

// Crear tablas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    detection_method TEXT,
    class_date TEXT
  )`);
});

let beaconActive = false;
let activeClassDate = null;

// Rutas
app.get('/api/attendance', (req, res) => {
  const { date, class_date } = req.query;
  const dateToFilter = class_date || date;
  
  if (dateToFilter) {
    db.all('SELECT * FROM attendance WHERE class_date = ? ORDER BY timestamp DESC', [dateToFilter], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM attendance ORDER BY timestamp DESC', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM attendance WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ message: 'Registro eliminado exitosamente' });
  });
});

app.delete('/api/attendance/clear', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Fecha requerida' });
  
  db.run('DELETE FROM attendance WHERE class_date = ?', [date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: `Se eliminaron ${this.changes} registros de la fecha ${date}`,
      deleted_count: this.changes
    });
  });
});

app.delete('/api/attendance/delete-multiple', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Lista de IDs requerida' });
  }
  
  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM attendance WHERE id IN (${placeholders})`, ids, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: `Se eliminaron ${this.changes} de ${ids.length} registros`,
      deleted_count: this.changes
    });
  });
});

app.get('/api/beacon/status', (req, res) => {
  res.json({ active: beaconActive, class_date: activeClassDate });
});

app.post('/api/beacon/start', (req, res) => {
  const { class_date } = req.body;
  beaconActive = true;
  activeClassDate = class_date || new Date().toISOString().split('T')[0];
  res.json({ message: 'Beacon started', class_date: activeClassDate });
});

app.post('/api/beacon/stop', (req, res) => {
  beaconActive = false;
  activeClassDate = null;
  res.json({ message: 'Beacon stopped' });
});

app.post('/api/attendance/register', (req, res) => {
  const { student_id, method = 'BLE' } = req.body;
  
  if (!beaconActive) {
    return res.status(400).json({ error: 'Beacon is not active' });
  }
  
  db.run(
    'INSERT INTO attendance (student_id, detection_method, class_date) VALUES (?, ?, ?)',
    [student_id, method, activeClassDate],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Attendance registered successfully' });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});