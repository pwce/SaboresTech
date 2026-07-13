# 1. Usamos una imagen oficial de Node estable
FROM node:22-alpine

# 2. Creamos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código del backend
COPY . .

# 6. Exponemos el puerto interno del backend 
EXPOSE 3000

# 7. Comando para iniciar la aplicación
CMD ["npm", "start"]