# Combined Dockerfile for Frontend and Backend (Back4App/Production)

# Stage 1: Build Frontend
FROM node:18 AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend & Static File Server
FROM python:3.11-slim
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Back4App/Heroku/Standard containers typically use port 8080
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

# Copy built frontend to the 'static' directory in the backend app root
# This matches the 'static' path we added to backend/app/main.py
COPY --from=frontend-builder /frontend/dist ./static

# Expose the production port
EXPOSE 8080

# Run the application with Gunicorn
CMD gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
