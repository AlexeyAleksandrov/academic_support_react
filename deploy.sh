#!/bin/bash

# 🚀 Скрипт быстрого деплоя Academic Support на VPS

set -e  # Остановка при ошибке

echo "🚀 Запуск деплоя Academic Support..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker не установлен! Пожалуйста, установите Docker."
    exit 1
fi

# Проверка наличия Docker Compose V2
if ! docker compose version &> /dev/null; then
    log_error "Docker Compose V2 не установлен! Пожалуйста, установите Docker Compose V2."
    exit 1
fi

log_info "Docker и Docker Compose найдены ✓"

# Остановка старых контейнеров
log_info "Остановка старых контейнеров..."
docker compose down 2>/dev/null || true

# Очистка старых образов (опционально)
read -p "Удалить старые Docker образы для очистки места? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Очистка старых образов..."
    docker image prune -f
fi

# Сборка нового образа
log_info "Сборка Docker образа..."
docker compose build --no-cache

# Запуск контейнеров
log_info "Запуск контейнеров..."
docker compose up -d

# Проверка статуса
log_info "Проверка статуса контейнеров..."
sleep 3
docker compose ps

# Получение IP адреса сервера
SERVER_IP=$(hostname -I | awk '{print $1}')

# Итоговое сообщение
echo ""
log_info "=========================================="
log_info "✅ Деплой завершен успешно!"
log_info "=========================================="
echo ""
log_info "Приложение доступно по адресу:"
log_info "  http://${SERVER_IP}"
echo ""
log_info "Для просмотра логов используйте:"
echo "  docker compose logs -f frontend"
echo ""
log_info "Для остановки приложения:"
echo "  docker compose down"
echo ""

# Показать логи на 5 секунд
log_info "Показ логов (5 секунд)..."
timeout 5 docker compose logs -f frontend || true

echo ""
log_info "🎉 Готово! Ваше приложение запущено!"
