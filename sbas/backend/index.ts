import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { startBeacon, isBeaconActive } from "./beacon";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "attendance.db");

let db: Database<sqlite3.Database, sqlite3.Statement>;

// Inicializa la base de datos y crea la tabla si no existe
async function initDb() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      detection_method TEXT,
      class_date TEXT
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    );
  `);
}

// Endpoint para registrar asistencia
app.post("/api/attendance/register", async (req, res) => {
  const { student_id, method, class_date } = req.body;
  if (!student_id || !method || !class_date) return res.status(400).json({ error: "Missing data" });

  // Verifica duplicados por estudiante y clase
  const existing = await db.get(
    `SELECT * FROM attendance WHERE student_id = ? AND class_date = ?`,
    [student_id, class_date]
  );
  if (existing) {
    return res.status(409).json({ error: "Ya registraste tu asistencia para esta clase." });
  }

  await db.run(
    "INSERT INTO attendance (student_id, detection_method, class_date) VALUES (?, ?, ?)",
    [student_id, method, class_date]
  );
  res.json({ success: true });
});

// Endpoint para obtener asistencias
app.get("/api/attendance", async (req, res) => {
  const { class_date } = req.query;
  let rows;
  if (class_date) {
    rows = await db.all("SELECT * FROM attendance WHERE class_date = ? ORDER BY timestamp DESC", [class_date]);
  } else {
    rows = await db.all("SELECT * FROM attendance ORDER BY timestamp DESC");
  }
  res.json(rows);
});

// Endpoint para iniciar el beacon virtual
app.post("/api/beacon/start", (req, res) => {
  startBeacon();
  res.json({ success: true, message: "Beacon virtual iniciado" });
});

// Endpoint para obtener el estado del beacon
app.get("/api/beacon/status", (req, res) => {
  res.json({ active: isBeaconActive() });
});

// Endpoint para registrar estudiantes
app.post("/api/students/register", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    await db.run("INSERT OR IGNORE INTO students (name) VALUES (?)", [name]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error registering student" });
  }
});

// Inicializa DB y arranca el servidor
initDb().then(() => {
  app.listen(5000, () => {
    console.log("Backend listening on http://localhost:5000");
  });
});