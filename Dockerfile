# Etapa 1: Construcción
# FROM node:18-alpine AS builder

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# # Etapa 2: Imagen final (solo archivos necesarios)
# FROM node:18-alpine

# WORKDIR /usr/src/app

# COPY --from=builder /usr/src/app/package*.json ./
# COPY --from=builder /usr/src/app/dist ./dist
# COPY --from=builder /usr/src/app/node_modules ./node_modules

# EXPOSE 4000

# CMD ["npm", "run", "start:prod"]

# Etapa 1: Construcción
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
COPY fonts ./fonts

RUN npm run build

# Etapa 2: Imagen final
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/fonts ./fonts

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
