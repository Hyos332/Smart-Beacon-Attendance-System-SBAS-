# 🎓 Smart Beacon Attendance System (SBAS)

[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Available-brightgreen)](https://frontend-mmymbya1j-hyos332s-projects.vercel.app)
[![Student App](https://img.shields.io/badge/📱%20Student%20App-Live-blue)](https://webapp-student-a917d4tbh-hyos332s-projects.vercel.app)
[![API Backend](https://img.shields.io/badge/🔌%20API%20Backend-Live-orange)](https://truthful-balance-production.up.railway.app)

## 🌟 **¡SISTEMA EN PRODUCCIÓN!**

**Smart Beacon Attendance System (SBAS)** es una solución integral **COMPLETAMENTE DESPLEGADA** para el control automatizado de asistencias en entornos educativos. 

✅ **Arquitectura moderna:** React + TypeScript + Node.js  
✅ **Desplegado globalmente:** Vercel + Railway  
✅ **100% funcional:** Sistema completo en producción  
✅ **Tiempo real:** Actualizaciones instantáneas  
✅ **Responsive:** Funciona en cualquier dispositivo

---

## 🌐 **APLICACIONES EN VIVO**

| 📱 **Aplicación** | 🔗 **URL en Producción** | 📋 **Descripción** |
|------------------|--------------------------|-------------------|
| **👩‍🏫 Teacher Dashboard** | [frontend-mmymbya1j-hyos332s-projects.vercel.app](https://frontend-mmymbya1j-hyos332s-projects.vercel.app) | Dashboard para profesores |
| **🎓 Student App** | [webapp-student-a917d4tbh-hyos332s-projects.vercel.app](https://webapp-student-a917d4tbh-hyos332s-projects.vercel.app) | App para registro de estudiantes |
| **🔌 Backend API** | [truthful-balance-production.up.railway.app](https://truthful-balance-production.up.railway.app) | API REST en Railway |

---

## 🏗️ **Arquitectura del Sistema**

### 🚀 **Stack Tecnológico**

1. **🖥️ Backend API** (Railway)
   - **Node.js + Express** - API REST escalable
   - **JSON Database** - Persistencia de datos
   - **CORS habilitado** - Comunicación cross-origin
   - **Health monitoring** - Monitoreo automático

2. **👩‍🏫 Teacher Dashboard** (Vercel)
   - **React 19 + TypeScript** - Interface moderna
   - **Tailwind CSS** - Diseño responsive
   - **Real-time updates** - Actualizaciones automáticas
   - **Export CSV** - Análisis de datos

3. **🎓 Student App** (Vercel)
   - **React 19 + TypeScript + PWA** - App instalable
   - **Web Bluetooth API** - Detección de beacons
   - **Responsive design** - Compatible con móviles
   - **Toast notifications** - Feedback instantáneo

---

## 🎯 **¡PRUEBA EL SISTEMA AHORA!**

### 👩‍🏫 **Para Profesores:**
1. **Accede:** [Teacher Dashboard](https://frontend-h2cfttp28-hyos332s-projects.vercel.app)
2. **Crea clase:** Selecciona la fecha actual
3. **Inicia beacon:** Habilita el registro virtual
4. **Monitorea:** Ve asistencias en tiempo real
5. **Gestiona:** Busca, filtra, elimina registros
6. **Exporta:** Descarga datos en CSV
7. **Finaliza:** Detén el beacon al terminar

### 🎓 **Para Estudiantes:**
1. **Accede:** [Student App](https://webapp-student-a917d4tbh-hyos332s-projects.vercel.app)
2. **Regístrate:** Ingresa tu nombre completo
3. **Registra asistencia:** Detección automática + un clic
4. **Confirmación:** Notificaciones en tiempo real
5. **Seguridad:** Sesión bloqueada tras registro

---

## 🛠️ **Tecnologías y Despliegue**

### 🚀 **Producción (LIVE)**
- **Frontend:** Vercel - CDN global con HTTPS automático
- **Backend:** Railway - Auto-scaling con health monitoring  
- **Database:** JSON persistente con backup automático
- **DNS:** URLs personalizadas con SSL
- **CI/CD:** Deploy automático desde GitHub

### 💻 **Desarrollo Local**
- **Containerización:** Docker + Docker Compose
- **Hot Reload:** Actualizaciones automáticas
- **Environment:** Variables de entorno separadas
- **Testing:** Jest + React Testing Library

### 🔧 **Stack Técnico**

| Capa | Tecnología | Descripción |
|------|------------|-------------|
| **Frontend** | React 19 + TypeScript | Apps modernas con tipado fuerte |
| **Styling** | Tailwind CSS | Diseño responsive y consistente |  
| **Backend** | Node.js + Express | API REST escalable |
| **Database** | JSON Files | Persistencia simple y confiable |
| **Deploy** | Vercel + Railway | Plataformas cloud modernas |
- **Networking:** Red privada de Docker con proxy
- **Persistencia:** Volúmenes Docker para datos
- **Health Monitoring:** Health checks automáticos

---

## 🚀 **Desarrollo Local**

### ⚡ **Setup Rápido**

```bash
# 1. Clonar el proyecto
git clone https://github.com/Hyos332/Smart-Beacon-Attendance-System-SBAS-.git
cd Smart-Beacon-Attendance-System-SBAS-

# 2. Configurar entorno
./scripts/setup-dev.sh

# 3. Levantar servicios
docker-compose up --build
```

### 📋 **URLs de Desarrollo**
- **Teacher Dashboard:** http://localhost:3000
- **Student App:** http://localhost:3001  
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

### 🛠️ **Comandos Útiles**

```bash
# Desarrollo completo
docker-compose up --build

# Solo backend
docker-compose up backend

# Ver logs en tiempo real  
docker-compose logs -f

# Pruebas locales
./scripts/test-local.sh

# Deploy a producción
./scripts/deploy.sh

# Detener todos los servicios
docker-compose down

# Limpiar datos y reconstruir
docker-compose down -v
docker-compose up --build
```

---

## 📁 **Estructura del Proyecto**

```
📦 SBAS/
├── 🚀 docker-compose.yml          # Orquestación completa
├── 🚀 docker-compose.prod.yml     # Configuración producción  
├── 📖 README.md                   # Este archivo
├── 📋 DEPLOYMENT.md               # Guía de despliegue
├── 🔧 ENVIRONMENT.md              # Variables de entorno
├── 📁 .github/workflows/          # CI/CD automático
├── 📁 scripts/                    # Scripts de automatización
│   ├── deploy.sh                  # Deploy completo
│   ├── setup-dev.sh               # Setup desarrollo
│   └── test-local.sh              # Pruebas locales
└── 📁 sbas/                       # Código fuente
    ├── 🔌 backend/                # API Backend (Railway)
    │   ├── 🐳 Dockerfile.prod     # Docker producción
    │   ├── ⚙️ railway.json        # Config Railway
    │   ├── 📦 package.json        # Dependencias Node
    │   ├── 🟢 index.js            # Servidor Express
    │   ├── 📡 beacon.js           # Simulación beacon
    │   └── 💾 data/               # Base de datos JSON
    ├── 👩‍🏫 frontend/              # Teacher Dashboard (Vercel)
    │   ├── 🐳 Dockerfile.prod     # Docker producción
    │   ├── ⚙️ vercel.json         # Config Vercel
    │   ├── 🎨 tailwind.config.js  # Estilos
    │   └── 📁 src/components/     # Componentes React
    └── 🎓 webapp_student/         # Student App (Vercel)
        ├── 🐳 Dockerfile.prod     # Docker producción
        ├── ⚙️ vercel.json         # Config Vercel
        ├── 🎨 tailwind.config.js  # Estilos
        └── 📁 src/                # App React + TypeScript
            ├── components/        # Componentes UI
            ├── hooks/            # React Hooks
            ├── services/         # Bluetooth API
            └── types/            # Definiciones TS
```

---

## Funcionalidades Detalladas

### Teacher Dashboard
- **Gestión de Clases:** Crear, ver y eliminar clases por fecha
- **Control de Beacon:** Iniciar/detener registro de asistencia
- **Monitoreo en Tiempo Real:** Actualización automática cada 3 segundos
- **Búsqueda Avanzada:** Filtrado de estudiantes por nombre
## ✨ **Características Principales**

### 👩‍🏫 **Teacher Dashboard**
- 📊 **Dashboard en tiempo real** - Actualizaciones automáticas cada 3s
- 🗓️ **Gestión de clases** - Crear y administrar clases por fecha
- 🔛 **Control de beacon** - Iniciar/detener registro de asistencia
- 🔍 **Búsqueda avanzada** - Filtrar por nombre de estudiante
- 🗑️ **Gestión de registros** - Eliminar individuales o múltiples
- 📥 **Exportar CSV** - Descargar datos para análisis
- 📱 **Diseño responsive** - Funciona en cualquier dispositivo

### 🎓 **Student App**
- 🔐 **Login seguro** - Validación avanzada de nombres
- 🔍 **Detección automática** - Verifica clases activas
- ⚡ **Registro rápido** - Un clic para asistencia
- 🔔 **Notificaciones toast** - Feedback instantáneo
- 🛡️ **Anti-fraude** - Sesión bloqueada post-registro
- 💾 **Persistencia** - Mantiene sesión entre recargas
- 📶 **Estado de conexión** - Indicadores en tiempo real
- 📱 **PWA ready** - Instalable como app nativa

### 🔌 **Backend API**
- 🚀 **RESTful API** - Endpoints completos y documentados
- 🎯 **Beacon virtual** - Simulación para desarrollo
- 💾 **Persistencia JSON** - Base de datos simple y confiable
- 🏥 **Health monitoring** - Monitoreo de sistema
- 📝 **Logging avanzado** - Trazabilidad completa
- 🌐 **CORS configurado** - Comunicación segura
- ✅ **Validación robusta** - Entrada de datos validada

---

## 📋 **API Reference**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/beacon/status` | 📡 Estado actual del beacon |
| `POST` | `/api/beacon/start` | ▶️ Iniciar clase y beacon |
| `POST` | `/api/beacon/stop` | ⏹️ Finalizar clase |
| `GET` | `/api/attendance` | 📋 Obtener registros de asistencia |
| `POST` | `/api/attendance/register` | ✅ Registrar nueva asistencia |
| `DELETE` | `/api/attendance/:id` | 🗑️ Eliminar registro específico |
| `DELETE` | `/api/attendance/clear` | 🧹 Limpiar por fecha |
| `GET` | `/health` | 🏥 Estado del sistema |

---

## Configuración Avanzada

### Variables de Entorno

## 🔧 **Variables de Entorno**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `REACT_APP_API_URL` | URL del backend | `https://truthful-balance-production.up.railway.app` |
| `REACT_APP_ENV` | Entorno frontend | `production` |
| `GENERATE_SOURCEMAP` | Generar source maps | `false` |
| `BEACON_MODE` | Modo del beacon | `simulate` |
| `PORT` | Puerto del servidor | `5000` |

Ver [`ENVIRONMENT.md`](ENVIRONMENT.md) para configuración completa.

---

## 🚨 **Solución de Problemas**

### 🔧 **Desarrollo Local**

```bash
# Limpiar Docker completamente
docker-compose down --volumes --rmi all
docker system prune -af

# Reinstalar dependencias
rm -rf sbas/*/node_modules
./scripts/setup-dev.sh

# Verificar puertos libres
sudo lsof -ti:3000,3001,5000 | xargs kill -9
```

### 🌐 **Problemas de Producción**

```bash
# Verificar status de servicios
curl https://truthful-balance-production.up.railway.app/health
curl https://frontend-h2cfttp28-hyos332s-projects.vercel.app
curl https://webapp-student-a917d4tbh-hyos332s-projects.vercel.app

# Logs de Railway
railway logs

# Redeployar si es necesario
./scripts/deploy.sh
```

---

## 🔮 **Roadmap y Futuras Funcionalidades**

### 🚀 **Próximas Características**
- [ ] 🔐 **Autenticación JWT** - Sistema de login seguro multi-rol
- [ ] 🗄️ **PostgreSQL** - Base de datos robusta para producción
- [ ] 📱 **App Móvil** - Flutter con detección BLE real
- [ ] 📊 **Analytics** - Dashboard con métricas avanzadas
- [ ] 📈 **Reportes Excel** - Exportación con gráficos
- [ ] 🔔 **Push Notifications** - Alertas en tiempo real
- [ ] 🏢 **Multi-tenant** - Soporte múltiples instituciones
- [ ] 🌍 **i18n** - Internacionalización completa

### 🛠️ **Para Desarrolladores**

```bash
# Setup completo de desarrollo
git clone https://github.com/Hyos332/Smart-Beacon-Attendance-System-SBAS-.git
cd Smart-Beacon-Attendance-System-SBAS-
./scripts/setup-dev.sh

# Testing
npm test          # En cada directorio sbas/*/
./scripts/test-local.sh

# Contribuir
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

---

## 📄 **Licencia y Contacto**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/Hyos332/Smart-Beacon-Attendance-System-SBAS-)](https://github.com/Hyos332/Smart-Beacon-Attendance-System-SBAS-/issues)
[![GitHub Stars](https://img.shields.io/github/stars/Hyos332/Smart-Beacon-Attendance-System-SBAS-)](https://github.com/Hyos332/Smart-Beacon-Attendance-System-SBAS-/stargazers)

**📧 Contacto:** [Crear Issue](https://github.com/Hyos332/Smart-Beacon-Attendance-System-SBAS-/issues/new)

**💡 Contribuciones:** ¡Todas son bienvenidas! Lee [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## 🎉 **¡Gracias por usar SBAS!**

**Desarrollado con ❤️ para modernizar la gestión de asistencias educativas.**

🌟 **¡Dale una estrella si te gustó el proyecto!** 🌟
