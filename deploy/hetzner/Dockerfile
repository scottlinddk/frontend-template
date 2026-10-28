# Build from the repository root:
#   docker build -f deploy/hetzner/Dockerfile -t frontend .
# VITE_* values are public and baked into the bundle at build time.

FROM node:24-alpine AS build
WORKDIR /app
RUN npm install --global pnpm@12.16.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
ARG VITE_API_BASE_URL=/api
ARG VITE_AUTH_PROVIDER=none
ARG VITE_MSAL_CLIENT_ID
ARG VITE_MSAL_AUTHORITY
ARG VITE_MSAL_SCOPES
ARG VITE_CLERK_PUBLISHABLE_KEY
RUN pnpm exec vp build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY deploy/hetzner/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
