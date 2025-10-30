#!/bin/bash
set -e  # Остановить выполнение при любой ошибке

# Включаем BuildKit для ускорения сборки и кэширования
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "=== Starting deployment ==="
date

echo "1. Creating external network if not exists..."
# Проверяем, существует ли сеть
if ! docker network ls | grep -q app-network; then
    echo "Creating app-network..."
    docker network create app-network
else
    echo "Network app-network already exists"
fi

echo "2. Stopping existing containers..."
docker compose down

echo "3. Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/master

echo "4. Building and starting new containers..."
docker compose up -d --build

echo "5. Checking container status..."
docker compose ps

echo "=== Deployment completed successfully! ==="
date