# Multi-stage build
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# Static files from Vite build
COPY --from=build /app/dist /usr/share/nginx/html

# Template with $BACKEND_URL placeholder (envsubst substituted at runtime)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Custom entrypoint: runs envsubst ONLY on $BACKEND_URL, writes the
# substituted config to /etc/nginx/conf.d/default.conf, then hands
# off to nginx -g "daemon off;"
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

ENV BACKEND_URL=http://backend:8080
EXPOSE 80
