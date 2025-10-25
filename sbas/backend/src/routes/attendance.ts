import { Router } from "express";
import prisma from "../prisma"; // Ajusta la ruta según tu estructura

const router = Router();

router.post("/", async (req, res) => {
  const { studentId, beaconId, timestamp } = req.body;

  // Validar que el beacon existe
  const beacon = await prisma.beacon.findUnique({ where: { id: beaconId } });
  if (!beacon) return res.status(400).json({ error: "Beacon inválido" });

  // (Opcional: validar horario activo aquí)

  // Guardar asistencia
  const attendance = await prisma.attendance.create({
    data: { studentId, beaconId, timestamp: new Date(timestamp) },
  });

  res.json({ success: true, attendance });
});

router.get("/all", async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: { Student: true },
      orderBy: { timestamp: "desc" },
    });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener asistencias" });
  }
});

export default router;
