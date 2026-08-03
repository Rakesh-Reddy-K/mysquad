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

# nginx config — BACKEND_URL baked in at build time.
# Change this value when redeploying if the backend URL changes.
ARG BACKEND_URL=https://mysquad-backend-s0aq.onrender.com
COPY nginx.conf.template /tmp/default.conf.template
RUN sed -i "s|\$BACKEND_URL|${BACKEND_URL}|g" /tmp/default.conf.template \
    && mv /tmp/default.conf.template /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]