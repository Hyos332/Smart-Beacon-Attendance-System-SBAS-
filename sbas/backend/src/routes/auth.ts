import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Esquemas de validación
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['STUDENT', 'TEACHER']),
  studentId: z.string().optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);
    
    // Verificar email único
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentId: true
      }
    });

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.issues });
    }
    
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentId: user.studentId
      },
      token
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;