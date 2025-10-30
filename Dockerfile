# syntax=docker/dockerfile:1

# Multi-stage build для оптимизации размера образа

# Стадия 1: Сборка приложения
FROM node:20-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка всех зависимостей с кэшированием npm
# BuildKit будет кэшировать npm cache между сборками
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Копирование исходного кода
COPY . .

# Сборка приложения для production
RUN npm run build

# Стадия 2: Production образ с nginx
FROM nginx:alpine

# Копирование собранного приложения из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Копирование кастомной конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Экспонирование порта 80
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
