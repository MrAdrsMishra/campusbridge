

# ---- Build API (NestJS) ----
FROM node:22-alpine AS build-api
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --include-workspace-root
COPY apps/api apps/api
RUN npm run build --workspace=@nexteduwise/api

# ---- Production image ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev --include-workspace-root
COPY --from=build-api /app/apps/api/dist apps/api/dist
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
