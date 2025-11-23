# 🗄️ Migración a PostgreSQL - Guía Completa

## ✅ Cambios Realizados

1. **Schema de Prisma**: Actualizado de SQLite a PostgreSQL
2. **Docker Compose**: Agregado servicio de PostgreSQL 16
3. **Variables de entorno**: Actualizadas para usar PostgreSQL
4. **Script de migración**: Creado `scripts/migrate-db.sh`

---

## 🚀 Pasos para Ejecutar

### 1. Detener los contenedores actuales
```bash
docker-compose down -v
```

### 2. Reconstruir con PostgreSQL
```bash
docker-compose up -d postgres
```

### 3. Esperar a que PostgreSQL esté listo (10-15 segundos)
```bash
docker-compose logs -f postgres
# Espera a ver: "database system is ready to accept connections"
# Presiona Ctrl+C para salir de los logs
```

### 4. Ejecutar las migraciones
```bash
./scripts/migrate-db.sh
```

### 5. Levantar todos los servicios
```bash
docker-compose up --build
```

---

## 🔍 Verificación

### Comprobar que PostgreSQL está corriendo:
```bash
docker-compose ps
```

### Ver los logs de la base de datos:
```bash
docker-compose logs postgres
```

### Acceder a Prisma Studio (GUI para ver la BD):
```bash
cd sbas/backend
npm run db:studio
```
Abre: http://localhost:5555

---

## 📊 Credenciales de Desarrollo

- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: sbas_user
- **Password**: sbas_password_dev
- **Database**: sbas_db

**⚠️ IMPORTANTE**: Estas credenciales son SOLO para desarrollo local. En producción usa variables de entorno seguras.

---

## 🔧 Comandos Útiles

### Conectarse a PostgreSQL directamente:
```bash
docker exec -it sbas-postgres psql -U sbas_user -d sbas_db
```

### Ver las tablas creadas:
```sql
\dt
```

### Salir de psql:
```sql
\q
```

### Resetear la base de datos (CUIDADO - Borra todo):
```bash
cd sbas/backend
npx prisma migrate reset
```

---

## 🎯 Ventajas de PostgreSQL vs JSON

✅ **Escalabilidad**: Maneja millones de registros sin problemas  
✅ **Integridad**: Relaciones y constraints garantizados  
✅ **Concurrencia**: Múltiples escrituras simultáneas  
✅ **Consultas**: SQL completo con joins, agregaciones, etc.  
✅ **Backup**: Herramientas profesionales de respaldo  
✅ **Producción**: Usado por empresas Fortune 500  

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Error: "Migration failed"
```bash
# Limpiar y volver a intentar
docker-compose down -v
docker-compose up -d postgres
sleep 15
./scripts/migrate-db.sh
```

### Puerto 5432 ya en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :5432

# Detener PostgreSQL local si existe
sudo systemctl stop postgresql
```
