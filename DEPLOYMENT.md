# SBAS - Smart Beacon Attendance System

## 🎯 Configuración de Producción Completada

Tu sistema SBAS ahora está completamente configurado para desplegarse en producción. He creado todos los archivos necesarios para hostear tu aplicación en **Vercel** (frontends) y **Railway** (backend).

## 📁 Archivos Creados/Configurados

### Variables de Entorno
- ✅ `sbas/frontend/.env` - Variables de producción para el dashboard de profesores
- ✅ `sbas/webapp_student/.env` - Variables de producción para la app de estudiantes  
- ✅ `sbas/backend/.env.production` - Variables de producción para el backend

### Configuración de Despliegue
- ✅ `docker-compose.prod.yml` - Docker Compose para producción
- ✅ `.github/workflows/deploy.yml` - CI/CD automático con GitHub Actions
- ✅ `sbas/frontend/vercel.json` - Configuración de Vercel para profesores
- ✅ `sbas/webapp_student/vercel.json` - Configuración de Vercel para estudiantes
- ✅ `sbas/backend/railway.json` - Configuración de Railway para el backend

### Nginx y Optimización
- ✅ `sbas/frontend/nginx.prod.conf` - Nginx optimizado para el dashboard
- ✅ `sbas/webapp_student/nginx.prod.conf` - Nginx optimizado para PWA

### Scripts de Automatización  
- ✅ `scripts/deploy.sh` - Script completo de despliegue
- ✅ `scripts/test-local.sh` - Pruebas locales antes del despliegue
- ✅ `scripts/setup-dev.sh` - Configuración inicial de desarrollo

## 🚀 Pasos para Desplegar

### 1. Configurar Tokens y Variables
```bash
# En tu terminal, configura estas variables:
export RAILWAY_TOKEN="tu_railway_token"
export VERCEL_TOKEN="tu_vercel_token"  
export VERCEL_ORG_ID="tu_vercel_org_id"
export VERCEL_PROJECT_ID_FRONTEND="tu_frontend_project_id"
export VERCEL_PROJECT_ID_STUDENT="tu_student_project_id"
export REACT_APP_API_URL="https://tu-backend.railway.app"
```

### 2. Hacer Scripts Ejecutables
```bash
chmod +x scripts/*.sh
```

### 3. Probar Localmente
```bash
./scripts/test-local.sh
```

### 4. Desplegar a Producción
```bash
./scripts/deploy.sh
```

## 🌐 URLs de Producción (después del despliegue)
- **Backend API**: `https://sbas-backend.railway.app`
- **Dashboard Profesores**: `https://sbas-frontend.vercel.app`
- **App Estudiantes**: `https://sbas-student.vercel.app`

## 🔧 Configuración Manual Alternativa

### Railway (Backend)
1. Ve a [railway.app](https://railway.app) y crea un nuevo proyecto
2. Conecta tu repositorio GitHub
3. Selecciona la carpeta `sbas/backend`
4. Configura las variables de entorno de producción
5. Despliega automáticamente

### Vercel (Frontends)
1. Ve a [vercel.com](https://vercel.com) y crea nuevos proyectos
2. Conecta tu repositorio GitHub
3. Para el frontend de profesores: selecciona `sbas/frontend`
4. Para la app de estudiantes: selecciona `sbas/webapp_student`
5. Configura las variables de entorno en cada proyecto
6. Despliega automáticamente

## 🔒 Variables de Entorno Requeridas

### Railway (Backend)
- `NODE_ENV=production`
- `PORT=5000`
- `CORS_ORIGINS=https://tu-frontend.vercel.app,https://tu-student.vercel.app`
- `BEACON_UUID=E2C56DB5-DFFB-48D2-B060-D0F5A71096E0`
- `BEACON_MAJOR=1`
- `BEACON_MINOR=1`
- `JWT_SECRET=tu_jwt_secreto_seguro`
- `ADMIN_PASSWORD=tu_password_admin`

### Vercel (Frontends)
- `REACT_APP_API_URL=https://tu-backend.railway.app`
- `REACT_APP_ENV=production`
- `REACT_APP_SCHOOL_NAME=Nombre de tu Escuela`
- `REACT_APP_ADMIN_EMAIL=admin@tuescuela.com`
- `REACT_APP_BEACON_ID=E2C56DB5-DFFB-48D2-B060-D0F5A71096E0` (solo app estudiantes)
- `REACT_APP_SERVICE_UUID=180F` (solo app estudiantes)

## 🎉 ¡Listo!

Tu sistema SBAS está completamente preparado para producción con:
- ✅ **CI/CD Automático**: Push a main → despliegue automático
- ✅ **Optimización**: Gzip, caching, security headers
- ✅ **PWA**: App de estudiantes instalable
- ✅ **Monitoreo**: Health checks y logging
- ✅ **Escalabilidad**: Configuración para crecimiento

**¿Quieres que te ayude con algún paso específico del despliegue?**