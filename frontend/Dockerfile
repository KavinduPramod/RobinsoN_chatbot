# Multi-stage Dockerfile for building and serving the Vite React frontend

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies based on package.json (simple, predictable)
# We only copy package.json to leverage Docker layer caching; .dockerignore excludes node_modules/dist
COPY package.json ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:stable-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (proxy /chat/ to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 and run nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
