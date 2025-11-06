import { z } from 'zod';

// Esquemas de autenticación
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  role: z.enum(['STUDENT', 'TEACHER'], { 
    message: 'El rol debe ser STUDENT o TEACHER' 
  }),
  studentId: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Esquemas de clases
export const CreateClassSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  beaconId: z.string().min(1, 'El ID del beacon es requerido')
});

export const UpdateClassSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  beaconId: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

// Esquemas de asistencia
export const AttendanceRegisterSchema = z.object({
  classId: z.string().uuid('ID de clase inválido'),
  beaconId: z.string().min(1, 'El ID del beacon es requerido')
});

export const AttendanceQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

// Esquemas de usuario
export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  studentId: z.string().optional()
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'La confirmación de contraseña es requerida')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Tipo inferidos para TypeScript
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type CreateClassData = z.infer<typeof CreateClassSchema>;
export type UpdateClassData = z.infer<typeof UpdateClassSchema>;
export type AttendanceRegisterData = z.infer<typeof AttendanceRegisterSchema>;
export type AttendanceQueryData = z.infer<typeof AttendanceQuerySchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;