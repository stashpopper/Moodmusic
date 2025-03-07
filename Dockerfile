# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build and run backend
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend production dependencies only
RUN npm install --only=production

# Copy backend files
COPY backend/ ./

# Copy built frontend files
COPY --from=frontend-builder /app/frontend/dist ./public

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV MISTRAL_API_KEY='u0OB4jjq6lnE3qDButeAbONHKnxx6Vvj'
ENV MONGODB_URI="mongodb+srv://hritam:sushanta@hritam.s0pgx.mongodb.net/?retryWrites=true&w=majority&appName=Hritam"
ENV LASTFM_API_KEY='39710bc3d90394f50aab976eca17a709'


# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
