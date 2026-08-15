FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --include-workspace-root
COPY apps/web apps/web
ARG VITE_API_URL=/api
ENV VITE_API_URL=
RUN npm run build --workspace=@nexteduwise/web

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
