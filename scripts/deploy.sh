#!/bin/bash
set -e

echo "🚀 Iniciando despliegue de SBAS..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    log_error "No se encontró docker-compose.yml. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar variables de entorno requeridas
check_env_vars() {
    local required_vars=(
        "REACT_APP_API_URL"
        "RAILWAY_TOKEN" 
        "VERCEL_TOKEN"
        "VERCEL_ORG_ID"
        "VERCEL_PROJECT_ID_FRONTEND"
        "VERCEL_PROJECT_ID_STUDENT"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Variable de entorno requerida no está definida: $var"
            exit 1
        fi
    done
}

# Función para construir y probar localmente
build_and_test() {
    log_info "Construyendo y probando aplicaciones..."
    
    # Backend
    log_info "Probando backend..."
    cd sbas/backend
    npm ci
    npm test
    cd ../..
    
    # Frontend
    log_info "Probando frontend..."
    cd sbas/frontend
    npm ci
    npm test -- --coverage --watchAll=false
    npm run build
    cd ../..
    
    # Student App
    log_info "Probando aplicación de estudiantes..."
    cd sbas/webapp_student
    npm ci
    npm test -- --coverage --watchAll=false
    npm run build
    cd ../..
    
    log_info "✅ Todas las pruebas pasaron exitosamente"
}

# Función para desplegar backend a Railway
deploy_backend() {
    log_info "Desplegando backend a Railway..."
    
    cd sbas/backend
    
    # Instalar Railway CLI si no está disponible
    if ! command -v railway &> /dev/null; then
        log_info "Instalando Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Configurar Railway
    railway login --token "$RAILWAY_TOKEN"
    
    # Desplegar
    railway up --service sbas-backend --environment production
    
    cd ../..
    log_info "✅ Backend desplegado a Railway"
}

# Función para desplegar frontends a Vercel
deploy_frontends() {
    log_info "Desplegando frontends a Vercel..."
    
    # Instalar Vercel CLI si no está disponible
    if ! command -v vercel &> /dev/null; then
        log_info "Instalando Vercel CLI..."
        npm install -g vercel
    fi
    
    # Configurar Vercel
    vercel login --token "$VERCEL_TOKEN"
    
    # Desplegar Frontend de Profesores
    log_info "Desplegando frontend de profesores..."
    cd sbas/frontend
    vercel --prod --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID"
    cd ../..
    
    # Desplegar Aplicación de Estudiantes
    log_info "Desplegando aplicación de estudiantes..."
    cd sbas/webapp_student
    vercel --prod --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID"
    cd ../..
    
    log_info "✅ Frontends desplegados a Vercel"
}

# Función principal
main() {
    log_info "Verificando variables de entorno..."
    check_env_vars
    
    log_info "Construyendo y probando aplicaciones..."
    build_and_test
    
    log_info "Desplegando backend..."
    deploy_backend
    
    log_info "Desplegando frontends..."
    deploy_frontends
    
    log_info "🎉 ¡Despliegue completado exitosamente!"
    log_info "📋 URLs de las aplicaciones:"
    log_info "   • Backend: https://sbas-backend.railway.app"
    log_info "   • Frontend Profesores: https://sbas-frontend.vercel.app"
    log_info "   • App Estudiantes: https://sbas-student.vercel.app"
}

# Ejecutar función principal
main "$@"