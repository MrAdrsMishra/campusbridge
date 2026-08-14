

# ---- Build web (Vite SPA) ----
FROM node:22-alpine AS build-web
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace=@nexteduwise/web --include-workspace-root
COPY apps/web apps/web
# Production API calls go directly to the same origin (no proxy).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --workspace=@nexteduwise/web

# ---- Build API (NestJS) ----
FROM node:22-alpine AS build-api
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace=@nexteduwise/api --include-workspace-root
COPY apps/api apps/api
RUN npm run build --workspace=@nexteduwise/api

# ---- Production image (serves both the API and the web static files) ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev --workspace=@nexteduwise/api --include-workspace-root
COPY --from=build-api /app/apps/api/dist apps/api/dist
COPY --from=build-web /app/apps/web/dist apps/web/dist
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
