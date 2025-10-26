import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email } = req.body;
  if (!name || name.trim().length < 5) {
    return res.status(400).json({ error: "El nombre completo es requerido (mínimo 5 caracteres)." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "El email es requerido y debe ser válido." });
  }
  try {
    const student = await prisma.student.create({
      data: { name: name.trim(), email: email.trim() },
    });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Error al registrar estudiante." });
  }
});

export default router;