# ── ETAPA 1: BUILD ──────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx ng build --configuration production


# ── ETAPA FINAL: NGINX ───────────────────────────
FROM nginx:alpine AS nginx

COPY --from=builder /app/dist/frontend-clintec/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80