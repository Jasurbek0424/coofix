# syntax=docker/dockerfile:1.7
# COOFIX admin SPA — build static assets, serve with unprivileged nginx on :8080.

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
# Build-time flags (optional): VITE_CONTENT_LOCALES=ru,zh  VITE_STORE_URL=https://coofix.store
ARG VITE_CONTENT_LOCALES=ru
ARG VITE_STORE_URL=https://coofix.store
ENV VITE_CONTENT_LOCALES=$VITE_CONTENT_LOCALES VITE_STORE_URL=$VITE_STORE_URL
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
USER 101
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
