import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

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

export default router;
