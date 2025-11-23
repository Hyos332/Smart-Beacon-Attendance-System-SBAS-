#!/bin/bash
set -e

echo "🔄 Migrando base de datos a PostgreSQL..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Navegar al directorio del backend
cd sbas/backend

log_step "1. Generando cliente de Prisma..."
npx prisma generate

log_step "2. Creando migración inicial..."
npx prisma migrate dev --name init

log_step "3. Aplicando seed (datos de prueba)..."
npm run db:seed || log_warn "Seed no disponible o falló"

log_info "✅ Migración completada exitosamente"
log_info "📊 Puedes ver la base de datos con: npm run db:studio"
