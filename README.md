# Smart Beacon Attendance System (SBAS)

## Descripción del Proyecto

**Smart Beacon Attendance System (SBAS)** es una solución integral para el control automatizado de asistencias en entornos educativos, utilizando tecnología moderna de desarrollo web y arquitectura de microservicios con Docker.

El sistema está diseñado para **automatizar completamente el proceso de registro de asistencia**, eliminando el fraude, reduciendo el tiempo administrativo y proporcionando herramientas avanzadas de análisis y gestión para profesores.

---

## Arquitectura del Sistema

### Componentes Principales

**SBAS** consta de tres aplicaciones principales orquestadas con Docker:

1. **Backend API** (Node.js + Express)
   - API REST para gestión de datos
   - Simulación de beacon virtual
   - Base de datos con persistencia en JSON
   - Sistema de logging estructurado

2. **Teacher Dashboard** (React + TypeScript)
   - Interface web para profesores
   - Gestión de clases y control de beacon
   - Visualización en tiempo real de asistencias
   - Exportación de datos y análisis estadístico

3. **Student Web App** (React + TypeScript)
   - Aplicación web para estudiantes
   - Registro automático de asistencia
   - Sistema de notificaciones avanzado
   - Interfaz responsive y PWA-ready

---

## Flujo de Funcionamiento

### Para el Profesor
1. Accede al **Teacher Dashboard** en `http://localhost:3000`
2. Crea una nueva clase para la fecha actual
3. Inicia el beacon virtual para habilitar el registro
4. Monitorea en tiempo real las asistencias registradas
5. Puede buscar, filtrar, eliminar registros específicos
6. Exporta los datos a CSV para análisis posterior
7. Finaliza la clase desactivando el beacon

### Para el Estudiante
1. Accede a la **Student Web App** en `http://localhost:3001`
2. Inicia sesión con su nombre (validación automática)
3. El sistema detecta automáticamente si hay una clase activa
4. Registra su asistencia con un solo clic
5. Recibe confirmaciones y notificaciones del estado
6. Su sesión queda bloqueada por seguridad tras registrar asistencia

---

## Stack Tecnológico

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Almacenamiento:** Sistema de archivos JSON
- **CORS:** Configurado para desarrollo multi-origen
- **Health Checks:** Endpoint de monitoreo integrado

### Frontend (Teacher Dashboard)
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS con diseño responsive
- **Estado:** React Hooks + Local Storage
- **Exportación:** Biblioteca XLSX para Excel/CSV
- **Hot Reload:** Desarrollo en tiempo real

### Frontend (Student App)
- **Framework:** React 19 + TypeScript
- **UI/UX:** Sistema de notificaciones Toast avanzado
- **Validación:** Validación de formularios en tiempo real
- **Seguridad:** Bloqueo de sesión post-registro
- **PWA:** Progressive Web App capabilities

### DevOps
- **Containerización:** Docker + Docker Compose
- **Desarrollo:** Hot reload en todos los servicios
- **Networking:** Red privada de Docker con proxy
- **Persistencia:** Volúmenes Docker para datos
- **Health Monitoring:** Health checks automáticos

---

## Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose instalados
- Puertos 3000, 3001 y 5000 disponibles
- 4GB RAM recomendado

### Instalación Rápida

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Smart-Beacon-Attendance-System-SBAS-
   ```

2. **Levantar todos los servicios**
   ```bash
   docker-compose up --build
   ```

3. **Verificar servicios activos**
   ```bash
   docker-compose ps
   ```

4. **Acceder a las aplicaciones**
   - Teacher Dashboard: http://localhost:3000
   - Student Web App: http://localhost:3001
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Comandos Útiles

```bash
# Levantar en segundo plano
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f webapp-student

# Reconstruir un servicio específico
docker-compose build backend
docker-compose up -d backend

# Detener todos los servicios
docker-compose down

# Limpiar datos y reconstruir
docker-compose down -v
docker-compose up --build
```

---

## Estructura del Proyecto

```
/
├── docker-compose.yml           # Orquestación de servicios
├── README.md                    # Documentación principal
├── .vscode/                     # Configuración VS Code
│   └── settings.json
└── sbas/                        # Código fuente principal
    ├── backend/                 # API Backend
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── index.js             # Servidor principal
    │   ├── beacon.ts            # Lógica de beacon
    │   └── data/                # Persistencia de datos
    ├── frontend/                # Teacher Dashboard
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tailwind.config.js
    │   ├── public/
    │   └── src/
    │       ├── components/
    │       │   ├── HomeDashboard.tsx
    │       │   └── ClaseDashboard.tsx
    │       └── App.tsx
    └── webapp_student/          # Student Web App
        ├── Dockerfile
        ├── package.json
        ├── tailwind.config.js
        ├── public/
        └── src/
            ├── components/
            │   ├── AttendanceRegister.tsx
            │   ├── Header.tsx
            │   └── common/
            │       └── Toast.tsx
            ├── hooks/
            │   └── useToast.tsx
            ├── types/
            │   └── attendance.ts
            ├── utils/
            │   └── errorHandler.ts
            ├── config/
            │   └── api.ts
            └── App.tsx
```

---

## Funcionalidades Detalladas

### Teacher Dashboard
- **Gestión de Clases:** Crear, ver y eliminar clases por fecha
- **Control de Beacon:** Iniciar/detener registro de asistencia
- **Monitoreo en Tiempo Real:** Actualización automática cada 3 segundos
- **Búsqueda Avanzada:** Filtrado de estudiantes por nombre
- **Gestión de Registros:** Eliminar registros individuales o múltiples
- **Exportación:** Descarga de datos en formato CSV
- **Estadísticas:** Contadores de asistencia por método de detección
- **Interfaz Responsive:** Diseño adaptable a dispositivos móviles

### Student Web App
- **Sistema de Login:** Validación de nombres con regex avanzado
- **Detección Automática:** Verifica clases activas automáticamente
- **Registro de Asistencia:** Un clic para registrar presencia
- **Sistema de Notificaciones:** Toasts informativos, de éxito, error y advertencia
- **Bloqueo de Seguridad:** Sesión bloqueada post-registro para prevenir fraude
- **Persistencia de Sesión:** Mantiene login entre recargas de página
- **Indicadores de Conexión:** Estado de conectividad en tiempo real
- **Progressive Web App:** Funcionalidad offline básica

### Backend API
- **Endpoints RESTful:** API completa para todas las operaciones
- **Simulación de Beacon:** Modo virtual para desarrollo y testing
- **Persistencia de Datos:** Almacenamiento en archivos JSON
- **Health Monitoring:** Endpoint de salud del sistema
- **Logging Estructurado:** Logs detallados para debugging
- **CORS Configurado:** Comunicación segura entre servicios
- **Validación de Datos:** Validación de entrada en todos los endpoints

---

## API Endpoints

### Beacon Management
```
GET    /api/beacon/status      # Estado del beacon
POST   /api/beacon/start       # Iniciar clase
POST   /api/beacon/stop        # Finalizar clase
```

### Attendance Management
```
GET    /api/attendance         # Obtener registros
POST   /api/attendance/register # Registrar asistencia
DELETE /api/attendance/:id     # Eliminar registro específico
DELETE /api/attendance/clear   # Limpiar registros por fecha
DELETE /api/attendance/delete-multiple # Eliminar múltiples registros
```

### System Health
```
GET    /health                 # Estado del sistema
```

---

## Configuración Avanzada

### Variables de Entorno

**Backend:**
- `NODE_ENV`: Entorno de ejecución (development/production)
- `BEACON_MODE`: Modo de beacon (simulate/real)
- `PORT`: Puerto del servidor (default: 5000)

**Frontend Apps:**
- `REACT_APP_API_URL`: URL del backend API
- `PORT`: Puerto de la aplicación React

### Personalización

1. **Cambiar puertos:** Editar `docker-compose.yml`
2. **Configurar CORS:** Modificar `sbas/backend/index.js`
3. **Ajustar intervalos:** Cambiar polling en `config/api.ts`
4. **Personalizar UI:** Modificar archivos de componentes React

---

## Solución de Problemas

### Problemas Comunes

**Puertos ocupados:**
```bash
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9
```

**Problemas de caché Docker:**
```bash
docker-compose down
docker system prune -f
docker-compose up --build --force-recreate
```

**Error de permisos:**
```bash
sudo chown -R $USER:$USER .
```

### Logs de Debugging
```bash
# Ver todos los logs
docker-compose logs

# Logs específicos con follow
docker-compose logs -f backend
docker-compose logs -f frontend-teacher
docker-compose logs -f webapp-student
```

---

## Desarrollo y Contribución

### Configuración de Desarrollo

1. **Instalar dependencias localmente** (opcional, para IDE support):
   ```bash
   cd sbas/backend && npm install
   cd sbas/frontend && npm install
   cd sbas/webapp_student && npm install
   ```

2. **Desarrollo con hot reload:** Los volúmenes Docker permiten hot reload automático

3. **Testing:** Cada aplicación incluye Jest y Testing Library

### Próximas Funcionalidades

- **Autenticación JWT:** Sistema de login seguro
- **Base de datos SQL:** PostgreSQL para producción
- **App móvil nativa:** Flutter para detección BLE real
- **Analytics avanzado:** Dashboard de métricas y reportes
- **Exportación Excel:** Reportes formateados
- **Notificaciones push:** Alertas en tiempo real
- **Multi-tenant:** Soporte para múltiples instituciones

---

## Licencia y Contacto

Este proyecto es de código abierto y está disponible bajo la licencia MIT. Para contribuciones, reportes de bugs o preguntas, por favor crear un issue en el repositorio.

**Desarrollado para automatizar y modernizar el control de asistencias en entornos educativos.**
