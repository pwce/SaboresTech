# 1. Usamos Node estable
FROM node:22-alpine as Builder

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY . .
RUN npm run build


# 2. Exponemos el puerto por defecto de Vite (5173)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# 3. Iniciamos Vite diciéndole que acepte conexiones externas (--host)
CMD ["nginx", "-g", "daemon off;"]