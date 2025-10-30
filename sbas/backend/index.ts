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
      detection_method TEXT
    );
  `);
}

// Endpoint para registrar asistencia
app.post("/api/attendance/register", async (req, res) => {
  const { student_id, method, timestamp } = req.body;
  if (!student_id || !method) {
    return res.status(400).json({ error: "student_id and method required" });
  }
  const ts = timestamp || new Date().toISOString();
  await db.run(
    "INSERT INTO attendance (student_id, timestamp, detection_method) VALUES (?, ?, ?)",
    [student_id, ts, method]
  );
  res.json({ success: true });
});

// Endpoint para obtener asistencias
app.get("/api/attendance", async (req, res) => {
  const rows = await db.all("SELECT * FROM attendance ORDER BY timestamp DESC");
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

// Inicializa DB y arranca el servidor
initDb().then(() => {
  app.listen(5000, () => {
    console.log("Backend listening on http://localhost:5000");
  });
});