# Multi-stage Dockerfile para frontend-react (SPA React 19 + Vite + TypeScript)
# Active Age - 4º Semestre (DevOps / CI/CD & Sistemas Distribuídos)

# Estágio 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Instalação de dependências
COPY package*.json ./
RUN npm ci

# Compilação dos assets estáticos
COPY . .
RUN npm run build

# Estágio 2: Runtime com Nginx Alpine ultra-leve
FROM nginx:1.27-alpine AS runner

# Copia build estático compilado
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada de proxy e roteamento SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
