# Smart Beacon Attendance System (SBAS)

## Propósito del Proyecto

**Smart Beacon Attendance System (SBAS)** es una solución integral para el control de asistencias en entornos educativos o empresariales, utilizando tecnología de beacons BLE (Bluetooth Low Energy).  
El objetivo principal es **mejorar y automatizar el registro de asistencia en clase**, evitando el fraude y ahorrando tiempo tanto a profesores como a estudiantes.

---

## ¿Cómo funciona SBAS?

### 1. **Para el profesor**
- Instala un **beacon BLE** en el aula o salón.
- Accede al **dashboard web** para monitorear en tiempo real quiénes han registrado su asistencia.
- Puede buscar, filtrar, exportar y consultar el historial de asistencias desde cualquier navegador.

### 2. **Para el estudiante**
- Usa la **app móvil** (Flutter) para detectar el beacon BLE al ingresar al aula.
- La app envía automáticamente el registro de asistencia al backend, sin intervención manual.
- El estudiante solo necesita tener el Bluetooth activado y la app abierta cerca del beacon.

---

## Flujo general

1. **El beacon BLE** emite una señal única en el aula.
2. **El estudiante**, al entrar, detecta el beacon con su app móvil y se registra automáticamente.
3. **El backend** recibe el registro y lo almacena en la base de datos.
4. **El profesor** visualiza en el dashboard web quiénes asistieron, con opciones de búsqueda, paginación y exportación.

---

## Tecnologías Utilizadas

- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Frontend:** React, TypeScript, Tailwind CSS
- **Base de datos:** PostgreSQL
- **Mobile App:** Flutter (para escanear beacons y enviar asistencias)
- **Docker & Docker Compose:** Para orquestar y facilitar el despliegue de todos los servicios
- **Prisma:** ORM para modelado y migración de la base de datos

---

## Arquitectura General

- **Mobile App:** Detecta beacons BLE y envía registros de asistencia al backend.
- **Backend:** Expone una API REST para recibir y consultar asistencias, gestiona la base de datos con Prisma.
- **Frontend:** Dashboard web para visualizar, buscar, paginar y exportar asistencias.
- **Base de datos:** PostgreSQL almacena estudiantes, beacons y registros de asistencia.
- **Docker Compose:** Levanta todos los servicios con un solo comando, asegurando entornos consistentes.

---

## ¿Cómo levantar el proyecto?

1. **Clona el repositorio y entra a la carpeta raíz.**

2. **Levanta todos los servicios con Docker Compose:**
   ```bash
   docker compose up --build
   ```
   Esto iniciará:
   - PostgreSQL en el puerto **5433**
   - Backend en el puerto **3000**
   - Frontend en el puerto **3001**

3. **Accede a las aplicaciones:**
   - **Frontend (Dashboard):** [http://localhost:3001](http://localhost:3001)
   - **Backend (API):** [http://localhost:3000](http://localhost:3000)
   - **Base de datos:** Conéctate a `localhost:5433` (usuario: `sbauser`, password: `sbapass`, db: `sbasdb`)

4. **Carga datos de prueba (opcional):**
   ```bash
   curl -X POST http://localhost:3000/api/attendance/seed
   ```

---

## Funcionalidades principales

- Registro automático de asistencias vía beacons BLE y app móvil.
- Dashboard web con búsqueda, paginación y exportación a Excel.
- API REST para integración y consulta de datos.
- Fácil despliegue y desarrollo gracias a Docker.

---

## Estructura del repositorio

```
/
├── sbas/
│   ├── backend/      # Código fuente del backend (Node/Express/Prisma)
│   ├── frontend/     # Código fuente del frontend (React)
│   └── mobile_app/   # Código fuente de la app móvil (Flutter)
├── docker-compose.yml
└── README.md
```

---

## Notas

- Puedes modificar los puertos y credenciales en `docker-compose.yml` según tus necesidades.
- Si tienes dudas o quieres contribuir, ¡abre un issue o un pull request!

---
