# Запуск игры в Telegram (Web App) на Raspberry Pi

Данная инструкция описывает шаги по развертыванию собранного проекта `Space Invasion` на сервере Raspberry Pi 5 под Ubuntu с помощью Docker.

## Шаг 1: Сборка в Jenkins
Убедитесь, что в Jenkins включен параметр `BUILD_TELEGRAM`. При успешной сборке Jenkins:
1. Скомпилирует код (Vite + TS).
2. Соберет Docker-образ на базе Nginx (`Dockerfile.web`).
3. Загрузит образ в локальный реестр (`192.168.10.222:5050/spaceinvasion-web:latest`).

## Шаг 2: Запуск на Raspberry Pi
Перенесите файл `docker-compose.yml` из репозитория на вашу Raspberry Pi.

Перейдите в папку с файлом и выполните команду:
```bash
docker-compose up -d
```

Игра будет доступна по адресу `http://<IP_вашей_малинки>:8080`.

> [!WARNING]
> **Ограничение HTTP (Заглушка)**
> На данный момент игра доступна только по HTTP. Telegram Web App **категорически отказывается** открывать ссылки без `https://`. Для тестирования вы можете открыть `http://IP:8080` в обычном браузере, однако для полноценной привязки к Telegram Bot вам потребуется настроить HTTPS.
> 
> *Рекомендуемое решение в будущем: добавление Cloudflare Tunnel (`cloudflared`) в `docker-compose.yml` или проксирование через Nginx + Let's Encrypt.*

## Шаг 3: Настройка бота (через BotFather)
*(Выполняйте этот шаг только после настройки HTTPS!)*

1. Откройте Telegram и найдите официального бота **@BotFather**.
2. Выберите вашего бота (`/mybots`) -> `Bot Settings` -> `Menu Button` -> `Configure menu button`.
3. Отправьте HTTPS ссылку на ваш сервер.

Либо настройте инлайн кнопку в коде самого бота:
```json
{
  "inline_keyboard": [
    [
      {
        "text": "Запустить Space Invasion",
        "web_app": {
          "url": "https://your-secure-domain.com"
        }
      }
    ]
  ]
}
```
