import express from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import prisma from '../database/prisma';

const router = express.Router();

// GET /api/beacon/status - ¿hay una clase activa del docente?
router.get('/status', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  const active = await prisma.class.findFirst({ where: { teacherId: req.user!.userId, isActive: true } });
  res.json({ active: !!active });
});

// POST /api/beacon/start - activar una clase del docente (simple: activa la primera clase del docente)
router.post('/start', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  const anyClass = await prisma.class.findFirst({ where: { teacherId: req.user!.userId } });
  if (!anyClass) return res.status(404).json({ error: 'No tienes clases configuradas' });

  await prisma.class.update({ where: { id: anyClass.id }, data: { isActive: true } });
  res.json({ message: 'Clase activada' });
});

// POST /api/beacon/stop - desactivar la clase activa del docente
router.post('/stop', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  await prisma.class.updateMany({ where: { teacherId: req.user!.userId, isActive: true }, data: { isActive: false } });
  res.json({ message: 'Clase desactivada' });
});

export default router;


