# 🚀 Инструкция по деплою Frontend на VPS

Быстрый деплой React приложения Academic Support на VPS с Docker.

## 📋 Требования

**На VPS должны быть установлены:**
- Docker (с Docker Compose V2)
- Git

**Бэкенд:**
- Должен быть запущен и доступен на **localhost:8080** на том же сервере

### Установка Docker (если еще не установлен)

```bash
# Установка Docker с Compose V2
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Проверка
docker --version
docker compose version

# Перезагрузка для применения прав
sudo reboot
```

## 🚀 Быстрый старт

### 1. Загрузите проект на VPS

```bash
# Через Git
git clone https://github.com/your-username/academic-support-react.git
cd academic-support-react
```

Или через SCP с вашего компьютера:
```bash
scp -r C:\Users\ASUS\IdeaProjects\react_test user@your-vps-ip:/home/user/academic-support
```

### 2. Запустите деплой

**Автоматически (рекомендуется):**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Или вручную:**
```bash
docker compose up -d --build
```

### 3. Готово! 🎉

Откройте в браузере: **http://your-vps-ip**

## 📝 Как это работает

Приложение автоматически подключается к вашему бэкенду:
- Frontend контейнер слушает на **порту 80**
- Nginx внутри контейнера проксирует API запросы на **localhost:8080** (ваш бэкенд)
- Настройка `extra_hosts` в docker-compose.yml позволяет контейнеру обращаться к хосту

**Важно:** Убедитесь, что бэкенд запущен и доступен на порту 8080!

Проверить можно так:
```bash
curl http://localhost:8080/api/rpd
```

## 🔧 Управление

```bash
# Просмотр логов
docker compose logs -f frontend

# Проверка статуса
docker compose ps

# Перезапуск
docker compose restart

# Остановка
docker compose down
```

## 🔄 Обновление приложения

```bash
cd /path/to/academic-support
git pull
docker compose down
docker compose up -d --build
```

## 🌐 Настройка домена и SSL (опционально)

### Если нужен HTTPS с доменом:

```bash
# 1. Установите Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. Создайте конфигурацию nginx на хосте
sudo nano /etc/nginx/sites-available/academic-support
```

Вставьте:
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

Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/academic-support /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 3. Получите SSL сертификат
sudo certbot --nginx -d your-domain.com
```

**Важно:** Если используете nginx на хосте для SSL, измените порт в `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Вместо 80:80
```

И в конфигурации nginx на хосте измените на `http://localhost:8081`.

## 🐛 Troubleshooting

### Приложение не открывается
```bash
# Проверьте логи
docker compose logs frontend

# Проверьте статус
docker compose ps
```

### API запросы не работают
```bash
# 1. Убедитесь, что бэкенд запущен
docker ps | grep backend

# 2. Проверьте доступность бэкенда с хоста
curl http://localhost:8080/api/rpd

# 3. Проверьте логи nginx в контейнере
docker exec academic-support-frontend cat /var/log/nginx/error.log
```

### Порт 80 уже занят
```bash
# Найдите процесс
sudo lsof -i :80

# Остановите его или измените порт в docker-compose.yml
```

## 📊 Полезные команды

```bash
# Войти в контейнер
docker exec -it academic-support-frontend sh

# Проверить nginx конфигурацию
docker exec academic-support-frontend nginx -t

# Просмотр использования ресурсов
docker stats

# Очистка старых образов
docker image prune -a
```

## ✅ Проверочный список

После деплоя убедитесь:
- ✅ Бэкенд запущен и доступен на localhost:8080
- ✅ Frontend контейнер запущен: `docker compose ps`
- ✅ Приложение открывается в браузере
- ✅ API запросы работают (откройте DevTools → Network)
- ✅ Навигация между страницами работает

---

## 🎯 Итого

**Для запуска фронтенда:**
1. Убедитесь, что бэкенд запущен на localhost:8080
2. Загрузите проект на VPS
3. Выполните `./deploy.sh`
4. Готово! 🎉

**Структура на сервере:**
```
/home/user/
├── academic-support-backend/  (ваш бэкенд, порт 8080)
└── academic-support-frontend/ (этот проект, порт 80)
```

Каждый проект запускается отдельно через `docker compose up -d` в своей папке.
