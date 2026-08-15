# ---- Build API (NestJS) ----
FROM node:22-alpine AS build-api
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production image ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build-api /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
