#!/bin/bash
set -e

echo "🧪 Ejecutando pruebas locales de SBAS..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    log_error "Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

log_info "Construyendo contenedores..."
docker-compose build

log_info "Iniciando servicios..."
docker-compose up -d

log_info "Esperando que los servicios estén listos..."
sleep 10

# Verificar que los servicios estén corriendo
services=("backend" "frontend" "webapp_student")
for service in "${services[@]}"; do
    if docker-compose ps "$service" | grep -q "Up"; then
        log_info "✅ $service está corriendo"
    else
        log_error "❌ $service no está corriendo"
        docker-compose logs "$service"
        exit 1
    fi
done

# Probar endpoints
log_info "Probando endpoints..."

# Backend health check
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    log_info "✅ Backend health check OK"
else
    log_error "❌ Backend health check falló"
    exit 1
fi

# Frontend accessibility
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "✅ Frontend accesible"
else
    log_error "❌ Frontend no accesible"
    exit 1
fi

# Student app accessibility
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    log_info "✅ Aplicación de estudiantes accesible"
else
    log_error "❌ Aplicación de estudiantes no accesible"
    exit 1
fi

log_info "🎉 ¡Todas las pruebas locales pasaron!"
log_info "📋 Servicios disponibles:"
log_info "   • Backend: http://localhost:5000"
log_info "   • Frontend Profesores: http://localhost:3000"
log_info "   • App Estudiantes: http://localhost:3001"

echo
log_info "Para detener los servicios ejecuta: docker-compose down"