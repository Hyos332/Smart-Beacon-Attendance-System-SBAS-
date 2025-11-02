FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache curl python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript en lugar de usar ts-node
RUN npm run build

# Crear directorio para datos
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 5000

# Usar el archivo compilado en lugar de ts-node
CMD ["node", "dist/index.js"]