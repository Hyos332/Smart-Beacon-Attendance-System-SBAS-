#!/bin/bash
set -e

echo "🔧 Configurando entorno de desarrollo local..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Crear archivo .env.local si no existe
create_env_file() {
    local path="$1"
    local content="$2"
    
    if [ ! -f "$path" ]; then
        log_info "Creando $path..."
        echo "$content" > "$path"
    else
        log_warn "$path ya existe, saltando..."
    fi
}

log_info "Configurando variables de entorno locales..."

# Backend .env.local
create_env_file "sbas/backend/.env.local" "NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
BEACON_UUID=E2C56DB5-DFFB-48D2-B060-D0F5A71096E0
BEACON_MAJOR=1
BEACON_MINOR=1
DATABASE_URL=./data/database.json
JWT_SECRET=dev_jwt_secret_change_in_production
ADMIN_PASSWORD=admin123"

# Frontend .env.local
create_env_file "sbas/frontend/.env.local" "REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
GENERATE_SOURCEMAP=true
REACT_APP_SCHOOL_NAME=Mi Escuela
REACT_APP_ADMIN_EMAIL=admin@escuela.com"

# Student App .env.local
create_env_file "sbas/webapp_student/.env.local" "REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
GENERATE_SOURCEMAP=true
REACT_APP_BEACON_ID=E2C56DB5-DFFB-48D2-B060-D0F5A71096E0
REACT_APP_SERVICE_UUID=180F"

log_info "Instalando dependencias..."

# Backend
cd sbas/backend
npm install
cd ../..

# Frontend
cd sbas/frontend
npm install
cd ../..

# Student App
cd sbas/webapp_student
npm install
cd ../..

# Hacer scripts ejecutables
chmod +x scripts/*.sh

log_info "✅ Configuración completada"
log_info "📋 Próximos pasos:"
log_info "   1. Ejecuta: ./scripts/test-local.sh"
log_info "   2. O manualmente: docker-compose up"
log_info "   3. Accede a las aplicaciones:"
log_info "      • Backend: http://localhost:5000"
log_info "      • Frontend: http://localhost:3000"
log_info "      • Student App: http://localhost:3001"