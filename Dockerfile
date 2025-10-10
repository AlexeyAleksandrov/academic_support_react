# Multi-stage build для оптимизации размера образа

# Стадия 1: Сборка приложения
FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production && npm cache clean --force

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
