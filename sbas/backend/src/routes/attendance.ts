import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.post("/", async (req, res) => {
  const { studentId, beaconUuid } = req.body;
  if (!studentId || !beaconUuid) {
    return res.status(400).json({ error: "Faltan datos." });
  }
  try {
    // Busca el beacon por UUID
    const beacon = await prisma.beacon.findUnique({ where: { uuid: beaconUuid } });
    if (!beacon) {
      return res.status(404).json({ error: "Beacon no encontrado." });
    }
    // Registra la asistencia
    const attendance = await prisma.attendance.create({
      data: {
        studentId: studentId,
        beaconId: beacon.id,
        timestamp: new Date(),
      },
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: "Error al registrar asistencia." });
  }
});

export default router;
