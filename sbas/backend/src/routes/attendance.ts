import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.post("/", async (req, res) => {
  const { studentId, beaconUuid } = req.body;
  console.log("POST /api/attendance", { studentId, beaconUuid, body: req.body }); // <-- LOG

  // Validación extra
  if (!studentId || !beaconUuid || typeof beaconUuid !== "string" || beaconUuid.trim() === "") {
    return res.status(400).json({ error: "Faltan datos o beaconUuid inválido." });
  }

  try {
    const beacon = await prisma.beacon.findUnique({ where: { uuid: beaconUuid } });
    if (!beacon) {
      return res.status(404).json({ error: "Beacon no encontrado." });
    }
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        beaconId: beacon.id,
        timestamp: new Date(),
      },
    });
    res.json(attendance);
  } catch (err) {
    console.error(err); // <-- LOG DE ERROR
    res.status(500).json({ error: "Error al registrar asistencia." });
  }
});

export default router;
