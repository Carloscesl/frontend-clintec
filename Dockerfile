# ── ETAPA 1: Compilar ──────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npx ng build --configuration production

# ── ETAPA 2: Servidor SSR Node ─────────────────────
FROM node:24-alpine AS ssr

WORKDIR /app

COPY --from=builder /app/dist/frontend-clintec ./dist/frontend-clintec
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json .

EXPOSE 4000

CMD ["node", "dist/frontend-clintec/server/server.mjs"]

# ── ETAPA 3: Nginx como proxy reverso ─────────────
FROM nginx:alpine AS nginx

COPY --from=builder /app/dist/frontend-clintec/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80