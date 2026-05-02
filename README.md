# GeorgianCars — Next.js + Tailwind + shadcn/ui

Marketplace для объявлений из Telegram-каналов Грузии. Объявления нормализуются ИИ к единому типу.

## Стек
- **Next.js 15** (App Router, React 19)
- **Tailwind CSS** + **shadcn/ui** (Button, Badge, Input, Select, Checkbox, ToggleGroup, Card)
- **next-intl** для i18n (RU / EN / KA), переключение через cookie + Server Action
- **next-themes** для light/dark
- **Zustand** + persist для фильтров, сортировки, избранного, валюты, темы
- **react-leaflet** + OpenStreetMap для карты (компонент в духе [shadcn-map](https://shadcn-map.vercel.app/))
- **lucide-react** для иконок

## Структура
```
src/
  app/
    layout.tsx           # NextIntl + Theme + TopBar
    page.tsx             # / — главная (фильтры + сетка)
    listing/[id]/page.tsx
    favorites/page.tsx
    saved/page.tsx
    map/page.tsx
    actions.ts           # Server Action setLocale (cookie)
    globals.css          # shadcn CSS-vars + 4 палитры
  components/
    top-bar.tsx
    filters-panel.tsx
    listing-card.tsx
    listings-page.tsx
    listings-toolbar.tsx
    detail-view.tsx
    map-view.tsx
    theme-provider.tsx
    ui/                  # shadcn primitives
  i18n/request.ts        # next-intl config
  lib/
    data.ts              # моки Listing[]
    store.ts             # zustand
    utils.ts             # cn(), fmt
    filter-listings.ts   # apply filters + sort
messages/{ru,en,ka}.json
```

## Запуск
```bash
pnpm install   # или npm/yarn
pnpm dev
```

## Что внутри
- Главная: 14 фильтров (цена, год, пробег, литраж, мощность, марка, модель, топливо, коробка, привод, кузов, город, цвет, TG-канал, VIN-only, цена-only), 7 сортировок, поиск, плотность, grid/list.
- Карточка: бейджи цены (great/good/fair/high/overpriced), VIN ✓, NEW, лайк.
- Детали: галерея, AI-саммари с индикатором справедливости цены, спеки, опции, оригинальный пост, sticky-сайдбар с большой кнопкой «Открыть в Telegram».
- Избранное (zustand persist).
- Сохранённые поиски с уведомлениями в Telegram (моки).
- Карта: реальный leaflet с пинами по городам Грузии и панелью объявлений выбранного города.
- 4 палитры через `data-palette` (electric / sunset / azure / tbilisi), light/dark через `next-themes`.

## TODO
- API-роут для подгрузки объявлений из Telegram-канала (Bot API / MTProto).
- ИИ-нормализация (OpenAI structured output) → единая схема `Listing`.
- Уведомления о сохранённых поисках через Telegram-бота.
