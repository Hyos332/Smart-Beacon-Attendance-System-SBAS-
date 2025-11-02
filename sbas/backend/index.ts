import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "attendance.db");

let db: Database<sqlite3.Database, sqlite3.Statement>;
let beaconActive = false;
let activeClassDate: string | null = null;

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
  const { student_id, method } = req.body;
  
  console.log("[DEBUG] Request body:", req.body);
  console.log("[DEBUG] student_id:", student_id);
  console.log("[DEBUG] method:", method);
  console.log("[DEBUG] activeClassDate:", activeClassDate);
  
  // Usar la clase activa automáticamente
  const class_date = activeClassDate;
  
  if (!student_id) {
    return res.status(400).json({ error: "Missing student_id" });
  }
  
  if (!method) {
    return res.status(400).json({ error: "Missing method" });
  }
  
  if (!class_date) {
    return res.status(400).json({ error: "No hay clase activa. La profesora debe iniciar la clase primero." });
  }

  try {
    // Verifica duplicados por estudiante y clase
    const existing = await db.get(
      `SELECT * FROM attendance WHERE student_id = ? AND class_date = ?`,
      [student_id, class_date]
    );
    
    if (existing) {
      return res.status(409).json({ error: "Ya registraste tu asistencia para esta clase." });
    }

    // Insertar nuevo registro
    await db.run(
      "INSERT INTO attendance (student_id, detection_method, class_date) VALUES (?, ?, ?)",
      [student_id, method, class_date]
    );
    
    console.log("[BACKEND] Asistencia registrada exitosamente:", { student_id, class_date });
    res.json({ success: true, class_date });
    
  } catch (error) {
    console.error("[BACKEND] Error al registrar asistencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
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

// Endpoint para verificar si un estudiante ya tiene asistencia registrada
app.get("/api/attendance/check", async (req, res) => {
  const { student_id } = req.query;
  
  // Usar la clase activa automáticamente
  const class_date = activeClassDate;
  
  console.log("[DEBUG] Check attendance - student_id:", student_id, "class_date:", class_date);
  
  if (!student_id) {
    return res.status(400).json({ error: "Missing student_id" });
  }
  
  if (!class_date) {
    return res.json({ hasAttendance: false, activeClass: null });
  }
  
  try {
    const existing = await db.get(
      `SELECT * FROM attendance WHERE student_id = ? AND class_date = ?`,
      [student_id, class_date]
    );
    
    res.json({ hasAttendance: !!existing, activeClass: class_date });
  } catch (error) {
    console.error("[BACKEND] Error checking attendance:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para iniciar el beacon virtual
app.post("/api/beacon/start", (req, res) => {
  const class_date = req.body?.class_date;
  if (!class_date) return res.status(400).json({ error: "Missing class_date" });
  beaconActive = true;
  activeClassDate = class_date;
  console.log(`[BEACON] Clase iniciada: ${class_date}`);
  res.json({ success: true });
});

// Endpoint para obtener el estado del beacon
app.get("/api/beacon/status", (req, res) => {
  console.log("[DEBUG] Beacon status - active:", beaconActive, "class_date:", activeClassDate);
  res.json({ active: beaconActive, class_date: activeClassDate });
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

// Endpoint para resetear asistencias de una clase
app.delete("/api/attendance/reset", async (req, res) => {
  const class_date = req.query.class_date as string;
  console.log("[BACKEND] Reseteando registros para la clase:", class_date);
  if (!class_date) return res.status(400).json({ error: "Missing class_date" });
  await db.run("DELETE FROM attendance WHERE class_date = ?", [class_date]);
  res.json({ success: true });
});

// Endpoint para detener el beacon virtual
app.post("/api/beacon/stop", (req, res) => {
  beaconActive = false;
  activeClassDate = null;
  console.log("[BEACON] Clase finalizada");
  res.json({ success: true });
});

// Inicializa DB y arranca el servidor
initDb().then(() => {
  app.listen(5000, () => {
    console.log("Backend listening on http://localhost:5000");
  });
});