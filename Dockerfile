# Imagen del frontend en dos etapas

# Etapa 1: Node.js ejecuta las herramientas del build (Vite deja el resultado en dist/)
FROM node:24-bookworm-slim AS build
WORKDIR /app
# Cypress no se usa dentro de la imagen: se evita descargar su programa
ENV CYPRESS_INSTALL_BINARY=0
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Las variables públicas de Vite se resuelven durante el build: la URL de la API se fija aquí
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etapa 2 (imagen final): Nginx publica los archivos de dist/
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
