# Combined Dockerfile for Frontend and Backend (Back4App/Production)

# Stage 1: Build Frontend
FROM node:22-slim AS frontend-builder
WORKDIR /frontend

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies like Vite)
# We do NOT set NODE_ENV=production here so that dev tools are installed
RUN npm install

# Copy the rest of the frontend source
COPY frontend/ ./

# Run the build
RUN npm run build

# Stage 2: Production Backend & Static File Server
FROM python:3.11-slim
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Render/Back4App use the PORT env var
ENV PORT 8080

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY backend/ .

# Copy built frontend from stage 1 to the backend's static folder
COPY --from=frontend-builder /frontend/dist ./static

# Expose the production port
EXPOSE 8080

# Run the application with Gunicorn
CMD gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
