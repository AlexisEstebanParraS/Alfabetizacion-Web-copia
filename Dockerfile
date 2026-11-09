# Imagen de la API Express (Node.js + código + dependencias)
FROM node:24-bookworm-slim

WORKDIR /app

# Dependencias primero: si package.json no cambia, Docker reutiliza esta capa
COPY package.json package-lock.json ./
RUN npm ci

# Código del backend (.dockerignore excluye .env, node_modules y archivos locales)
COPY --chown=node:node . .

ENV NODE_ENV=production
USER node

# EXPOSE documenta el puerto; la publicación se configura en docker-compose.yml
EXPOSE 3000

CMD ["node", "src/app.js"]
