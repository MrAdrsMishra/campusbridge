# ---- Development stage ----
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ---- Build Web (Vite React) ----
FROM node:22-alpine AS build-web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production image (Nginx) ----
FROM nginx:alpine AS prod
COPY nginx.conf* apps/web/nginx.conf* /etc/nginx/conf.d/default.conf
COPY --from=build-web /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
