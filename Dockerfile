# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm@9.0.0

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build Astro
RUN pnpm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Solo copiar lo necesario
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9.0.0
RUN pnpm install --prod --frozen-lockfile

# Copiar dist del builder
COPY --from=builder /app/dist ./dist

# Variables de entorno (placeholder)
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 8080

# Comando para iniciar
CMD ["node", "./dist/server/entry.mjs"]
