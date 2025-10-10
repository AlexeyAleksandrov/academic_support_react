# 🚀 Инструкция по деплою Frontend на VPS

Инструкция по развертыванию React приложения Academic Support на VPS с использованием Docker.

## 📋 Предварительные требования

На VPS должны быть установлены:
- Docker (версия 20.10+) с Docker Compose V2
- Git

### Быстрая установка Docker на Ubuntu/Debian

```bash
# Установка Docker (включает Docker Compose V2)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Проверка установки
docker --version
docker compose version

# Перезагрузка для применения прав
sudo reboot
```

## 📦 Деплой приложения

### 1. Загрузка проекта на VPS

**Вариант А: Через Git**
```bash
git clone https://github.com/your-username/academic-support-react.git
cd academic-support-react
```

**Вариант Б: Через SCP**
```bash
# С локальной машины:
scp -r C:\Users\ASUS\IdeaProjects\react_test user@your-vps-ip:/home/user/academic-support
```

### 2. Настройка подключения к бэкенду

Укажите адрес вашего бэкенда в `nginx.conf`:

```nginx
location /api/ {
    proxy_pass http://YOUR_BACKEND_IP:8080/api/;
    # ... остальные настройки
}
```

Если бэкенд на том же сервере, используйте:
- `http://localhost:8080` - если бэкенд на хосте
- `http://host.docker.internal:8080` - для Docker Desktop
- или раскомментируйте `extra_hosts` в `docker-compose.yml`

### 3. Запуск

**Способ 1: Автоматический (рекомендуется)**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Способ 2: Вручную**
```bash
docker compose up -d --build
```

### 4. Проверка

Откройте в браузере: `http://your-vps-ip`

## 🔧 Управление

### Основные команды

```bash
# Просмотр логов
docker compose logs -f frontend

# Проверка статуса
docker compose ps

# Перезапуск
docker compose restart

# Остановка
docker compose down

# Обновление (после git pull)
docker compose down
docker compose up -d --build
```

## 🌐 Настройка домена и SSL (опционально)

### Установка Certbot и получение SSL

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Создание конфигурации Nginx на хосте
sudo nano /etc/nginx/sites-available/academic-support
```

**Конфигурация:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Активация:**
```bash
sudo ln -s /etc/nginx/sites-available/academic-support /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com
```

**Важно:** Если nginx на хосте использует порт 80, измените порт в `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Используйте другой порт
```

И обновите proxy_pass в конфигурации хоста на `http://localhost:8081`.

## 🔒 Безопасность

```bash
# Настройка Firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 🐛 Troubleshooting

### Контейнер не запускается
```bash
docker compose logs frontend
docker compose config
```

### API запросы не работают
1. Проверьте адрес бэкенда в `nginx.conf`
2. Убедитесь, что бэкенд доступен:
```bash
curl http://YOUR_BACKEND_IP:8080/api/rpd
```

### Порт 80 занят
```bash
# Найти процесс на порту 80
sudo lsof -i :80

# Изменить порт в docker-compose.yml на другой
```

## 📝 Полезные команды

```bash
# Войти в контейнер
docker exec -it academic-support-frontend sh

# Проверить конфигурацию nginx
docker exec academic-support-frontend nginx -t

# Перезагрузить nginx
docker exec academic-support-frontend nginx -s reload

# Использование ресурсов
docker stats

# Очистка неиспользуемых образов
docker image prune -a
```

## 🎯 Итоговая проверка

После деплоя убедитесь:
- ✅ Приложение открывается в браузере
- ✅ API запросы работают (проверьте в DevTools → Network)
- ✅ Навигация по страницам работает
- ✅ Статические файлы загружаются

---

**Готово! Ваше приложение успешно развернуто! 🎉**

Для обновления приложения:
```bash
git pull
docker compose up -d --build
