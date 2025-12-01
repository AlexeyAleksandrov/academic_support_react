# Локальная разработка

## Обзор конфигурации

Проект настроен для работы в двух средах:
- **Локальная разработка** (`npm run dev`) - использует Vite proxy
- **Production на сервере** (Docker + nginx) - использует nginx proxy

## Как это работает

### Локальная разработка (npm run dev)

1. **Vite Proxy**: В `vite.config.js` настроен прокси:
   ```javascript
   proxy: {
     '/api': {
       target: 'http://194.135.20.4:8080',
       changeOrigin: true,
       secure: false,
     }
   }
   ```

2. **API запросы**: Все запросы к `/api/*` автоматически перенаправляются на `http://194.135.20.4:8080/api/*`

3. **Порт**: Vite dev server запускается на порту **5173** (по умолчанию)

### Production (Docker + nginx)

1. **Nginx Proxy**: В `nginx.conf` настроен проксирование на `backend:8080`
2. **API запросы**: Все запросы к `/api/*` перенаправляются на backend через Docker network
3. **Порт**: Приложение доступно на порту **80**

## Запуск локально

```bash
# Установите зависимости (если еще не установлены)
npm install

# Запустите dev server
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

## Переменные окружения

### `.env.local` (локальная разработка)
```
NODE_ENV=development
VITE_API_BASE_URL=
```

**Важно**: Файл `.env.local` НЕ коммитится в Git (уже добавлен в `.gitignore`)

### `.env.example` (шаблон)
Содержит пример конфигурации для разных окружений

## Устранение проблем

### Ошибка: "POST http://localhost:5181/api/auth/login 500"

**Причина**: Неправильный порт или proxy не работает

**Решение**:
1. Убедитесь, что используете порт **5173** (стандартный Vite порт)
2. Проверьте, что `vite.config.js` содержит правильную конфигурацию proxy
3. Перезапустите dev server: `Ctrl+C` и снова `npm run dev`

### Ошибка CORS

**Причина**: Прямые запросы к API без proxy

**Решение**: 
- В `api.js` используется пустой `baseURL`, чтобы запросы шли через proxy
- Убедитесь, что `VITE_API_BASE_URL` в `.env.local` пустой или не установлен

## Архитектура API

```
Локально:
Browser → http://localhost:5173/api/... → Vite Proxy → http://194.135.20.4:8080/api/...

Production:
Browser → http://194.135.20.4/api/... → nginx → backend:8080/api/...
```

## Проверка работы авторизации

1. Откройте `http://localhost:5173`
2. Перейдите на страницу логина
3. Введите учетные данные
4. Откройте DevTools (F12) → вкладка Network
5. При логине должен быть запрос: `POST http://localhost:5173/api/auth/login`
6. Статус ответа должен быть **200 OK** (если данные верные) или **401 Unauthorized** (если неверные)

## Deployment на сервер

Deployment выполняется автоматически через GitHub Actions:
- При push в `main` ветку запускается workflow `.github/workflows/deploy.yml`
- Скрипт `deploy.sh` выполняет:
  1. Pull нового кода
  2. Build Docker образа
  3. Перезапуск контейнеров

Ничего дополнительно настраивать не нужно!
