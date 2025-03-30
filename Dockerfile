# Build stage for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lockb ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install
COPY backend/ ./

# Production stage
FROM nginx:alpine
WORKDIR /app

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend
COPY --from=backend-build /app/backend /app/backend

# Copy NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Install Node.js for backend
RUN apk add --update nodejs npm

# Expose ports
EXPOSE 80 5000

# Start NGINX and Node.js server
CMD ["sh", "-c", "cd /app/backend && npm start & nginx -g 'daemon off;'"]
