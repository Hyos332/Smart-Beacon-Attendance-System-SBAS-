FROM node:18

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Crear directorio para datos
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["node", "index.js"]