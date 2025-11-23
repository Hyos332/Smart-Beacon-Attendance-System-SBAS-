FROM node:18

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Crear directorio para datos
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 5000

# Comando de inicio (usar código compilado)
CMD ["npm", "start"]