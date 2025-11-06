import express from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

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

// GET /api/attendance?class_date=YYYY-MM-DD - Listado de asistencias por fecha (docente)
router.get('/', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const classDate = (req.query.class_date as string) || '';
    if (!classDate) {
      return res.status(400).json({ error: 'class_date es requerido (YYYY-MM-DD)' });
    }

    const dayStart = new Date(`${classDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${classDate}T23:59:59.999Z`);

    const attendances = await prisma.attendance.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        class: { teacherId: req.user!.userId },
      },
      include: {
        class: true,
        student: {
          select: { id: true, firstName: true, lastName: true, studentId: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Adaptar al formato que el dashboard espera
    const result = attendances.map((a) => ({
      id: a.id,
      student_id: a.student.studentId || a.student.id,
      name: `${a.student.firstName} ${a.student.lastName}`.trim(),
      timestamp: a.createdAt,
      class_id: a.classId,
      class_name: a.class.name,
      detection_method: 'BLE'
    }));

    res.json(result);
  } catch (error) {
    console.error('Error listing attendance:', error);
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
// DELETE /api/attendance/delete/:id - Eliminar un registro (docente)
router.delete('/delete/:id', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({ where: { id }, include: { class: true } });
    if (!attendance || attendance.class.teacherId !== req.user!.userId) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    await prisma.attendance.delete({ where: { id } });
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/attendance/delete-multiple - Eliminar varios registros por id (docente)
router.delete('/delete-multiple', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const ids: string[] = (req.body && Array.isArray(req.body.ids)) ? req.body.ids : [];
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids es requerido' });
    }

    const toDelete = await prisma.attendance.findMany({
      where: { id: { in: ids }, class: { teacherId: req.user!.userId } },
      select: { id: true }
    });

    await prisma.attendance.deleteMany({ where: { id: { in: toDelete.map(a => a.id) } } });
    res.json({ message: `Eliminados ${toDelete.length} registro(s)` });
  } catch (error) {
    console.error('Error deleting multiple attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/attendance/clear?date=YYYY-MM-DD - Limpiar todos los registros de una fecha (docente)
router.delete('/clear', authenticateToken, requireRole(['TEACHER']), async (req: AuthRequest, res) => {
  try {
    const date = (req.query.date as string) || '';
    if (!date) {
      return res.status(400).json({ error: 'date es requerido (YYYY-MM-DD)' });
    }

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const deleted = await prisma.attendance.deleteMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        class: { teacherId: req.user!.userId },
      }
    });

    res.json({ message: `Eliminados ${deleted.count} registro(s)` });
  } catch (error) {
    console.error('Error clearing attendance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});