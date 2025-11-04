import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const CreateClassSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  beaconId: z.string()
});

const AttendanceRegisterSchema = z.object({
  classId: z.string(),
  studentId: z.string(),
  beaconId: z.string()
});

// GET /api/attendance/classes - Obtener clases del profesor
router.get('/classes', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { teacherId: req.user!.userId },
      include: {
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true
              }
            }
          }
        }
      }
    });

    res.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/attendance/classes - Crear nueva clase
router.post('/classes', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const data = CreateClassSchema.parse(req.body);

    const newClass = await prisma.class.create({
      data: {
        ...data,
        teacherId: req.user!.userId,
        isActive: false
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Clase creada exitosamente',
      class: newClass
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/attendance/classes/:id/toggle - Activar/desactivar clase
router.patch('/classes/:id/toggle', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existingClass = await prisma.class.findFirst({
      where: { 
        id,
        teacherId: req.user!.userId 
      }
    });

    if (!existingClass) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: { isActive: !existingClass.isActive }
    });

    res.json({
      message: `Clase ${updatedClass.isActive ? 'activada' : 'desactivada'} exitosamente`,
      class: updatedClass
    });

  } catch (error) {
    console.error('Error toggling class:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/attendance/active-classes - Obtener clases activas (para estudiantes)
router.get('/active-classes', authenticateToken, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const activeClasses = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ classes: activeClasses });
  } catch (error) {
    console.error('Error fetching active classes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/attendance/register - Registrar asistencia
router.post('/register', authenticateToken, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const data = AttendanceRegisterSchema.parse(req.body);

    // Verificar que la clase está activa
    const activeClass = await prisma.class.findFirst({
      where: { 
        id: data.classId,
        isActive: true,
        beaconId: data.beaconId
      }
    });

    if (!activeClass) {
      return res.status(400).json({ error: 'Clase no disponible o beacon incorrecto' });
    }

    // Verificar que el estudiante no ya registró asistencia
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        classId: data.classId,
        studentId: req.user!.userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)) // Hoy
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Asistencia ya registrada para esta clase hoy' });
    }

    // Registrar asistencia
    const attendance = await prisma.attendance.create({
      data: {
        classId: data.classId,
        studentId: req.user!.userId
      },
      include: {
        class: {
          select: {
            name: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            studentId: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Asistencia registrada exitosamente',
      attendance
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    
    console.error('Error registering attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/attendance/my-attendances - Obtener asistencias del estudiante
router.get('/my-attendances', authenticateToken, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { studentId: req.user!.userId },
      include: {
        class: {
          select: {
            name: true,
            description: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ attendances });
  } catch (error) {
    console.error('Error fetching attendances:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;