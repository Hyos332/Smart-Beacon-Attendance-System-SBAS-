import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// Registro de estudiante (solo nombre requerido)
router.post("/register", async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 5) {
    return res.status(400).json({ error: "El nombre completo es requerido (mínimo 5 caracteres)." });
  }
  try {
    const student = await prisma.student.create({ data: { name: name.trim() } });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Error al registrar estudiante." });
  }
});

export default router;