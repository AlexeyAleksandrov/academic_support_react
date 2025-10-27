#!/bin/bash
set -e  # Остановить выполнение при любой ошибке

echo "=== Starting deployment ==="
date

echo "1. Creating external network if not exists..."
docker network create app-network 2>/dev/null || echo "Network app-network already exists"

echo "2. Stopping existing containers..."
docker compose down

echo "3. Pulling latest code from GitHub..."
git pull origin master

echo "4. Building and starting new containers..."
docker compose up -d --build

echo "5. Checking container status..."
docker compose ps

echo "=== Deployment completed successfully! ==="
date