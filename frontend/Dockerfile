# 1. Usamos Node estable
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# 2. Exponemos el puerto por defecto de Vite (5173)
EXPOSE 5173

# 3. Iniciamos Vite diciéndole que acepte conexiones externas (--host)
CMD ["npm", "run", "dev", "--", "--host"]