# 🚘 GeorgianCars

**Авто из Telegram-каналов Грузии** — витрина объявлений о продаже автомобилей, собранных из Telegram-каналов и приведённых к единому формату: фильтры, карта, избранное, сравнение и оценка справедливости цены.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![next-intl](https://img.shields.io/badge/next--intl-4-5FC3E7?style=flat)](https://next-intl.dev)

Это фронтенд — тонкий клиент над FastAPI-бэкендом из соседнего репозитория: **https://github.com/kewldan/cars-backend**. Все данные приходят по `/api` (в dev — rewrite на `http://localhost:8080`, в проде — nginx → контейнер `cars-api`).

## ✨ Возможности

- 🔎 **Поиск и фильтры с состоянием в URL** — цена, год, пробег, марка/модель, топливо, коробка, город и др.; любой набор фильтров шарится обычной ссылкой
- ♾️ **Бесконечная лента** — `useSWRInfinite`, 24 объявления на страницу, догрузка по `IntersectionObserver`
- 🏷 **Оценка цены** — шкала great / good / fair / high / overpriced на карточке и в деталях, бейдж проверенного VIN
- ❤️ **Избранное без регистрации** — хранится на сервере, устройство идентифицируется заголовком `X-Device-Id` (UUID в `localStorage`)
- 🔖 **Сохранённые поиски** — именованные наборы фильтров с флагом уведомлений (`/saved-searches` на бэкенде)
- 🆚 **Сравнение объявлений** — плавающая панель сравнения (zustand)
- 🗺 **Карта объявлений** — react-leaflet + OpenStreetMap
- 🕘 **Недавно просмотренные** — локальная история (localStorage `gc_recent`)
- 🌐 **Три языка**: русский / английский / грузинский (next-intl, cookie `NEXT_LOCALE`, переключение через Server Action)
- 🎨 **4 цветовые палитры** (`electric` / `sunset` / `azure` / `tbilisi`) + тёмная тема без вспышки при загрузке
- 💱 **Цены в USD / RUB / GEL** — переключатель валюты
- 🖼 **OG-изображения** генерируются на лету для каждой страницы (`opengraph-image.tsx`), PWA-manifest
- 📸 **Фотогалереи** — embla-карусель + полноэкранный просмотр (react-photo-view)

## 🧰 Стек

- **Next.js 16** — App Router, RSC, React Compiler; **React 19**; **TypeScript** (strict)
- **Tailwind CSS 4** + Radix UI-примитивы + **motion** (анимации) + **lucide-react** (иконки)
- **SWR** (данные, infinite scroll, optimistic-мутации избранного) + **zustand** (локальные предпочтения: валюта, палитра, вид)
- **next-intl** — i18n (ru / en / ka)
- **react-leaflet** — карта; **sharp** — оптимизация изображений
- **Biome** — линт и формат; **Bun** — пакетный менеджер (`bun.lock`)

## 🚀 Быстрый старт

```bash
bun install

# поднимите бэкенд (cars-backend) на http://localhost:8080 —
# next.config.ts проксирует /api/* туда автоматически
bun dev
```

Приложение: http://localhost:3000. Продакшен-сборка:

```bash
bun run build
bun run start        # next start -p 80
```

### Переменные окружения

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_API_BASE` | База API для браузера (по умолчанию `/api`; можно указать абсолютный адрес бэкенда напрямую) |
| `API_URL` | База API для серверного кода (RSC, `generateMetadata`, OG-изображения); приоритетнее `NEXT_PUBLIC_API_BASE`, fallback — `http://localhost:8080` |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL сайта — `metadataBase` и абсолютные URL фотографий для `next/image` |

### Скрипты

```bash
bun dev              # dev-сервер
bun run build        # production build
bun run lint         # biome check
bun run lint:fix     # biome check --write
bun run format       # biome format --write
```

### Docker

`docker-compose.yml` поднимает `web` (этот фронтенд) и `proxy` (nginx, конфиг в `conf.d/`): браузер ходит на same-origin `/api/...`, nginx маршрутизирует эти запросы в контейнер бэкенда `cars-api`, остальное — в `web`. Серверный код фронтенда ходит в API через тот же nginx (`API_URL=http://proxy/api`), чтобы правила совпадали в обоих контекстах. Снаружи трафик заводится через Traefik-лейблы.

```bash
docker compose up -d --build
```

## 🗺 Маршруты

| Путь | Описание |
|---|---|
| `/` | Лента объявлений: поиск, фильтры, сортировка |
| `/listing/[id]` | Карточка объявления: галерея, спеки, оценка цены, ссылка на пост |
| `/favorites` | Избранное |
| `/saved` | Сохранённые поиски |
| `/compare` | Сравнение выбранных объявлений |
| `/map` | Карта объявлений |
| `/channel/[id]` | Редирект на ленту с фильтром по Telegram-каналу |
