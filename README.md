# FORUM.LIVE — Developers

Форум для разработчиков с тёмной темой в стиле GitHub. Backend на Node.js/Express, frontend на React + Vite + Tailwind.

## Возможности

- Регистрация и вход (JWT, срок действия токена настраивается)
- Разделы форума, темы, комментарии, голосование
- Статьи — отдельный раздел с карточной вёрсткой
- Правила форума — редактируются из админ-панели
- Личные сообщения с AI-ассистентом (черновик ответа по контексту переписки, требует OpenAI API key в настройках профиля)
- Стена (лента активности), профили пользователей, трофеи/ранги
- Админ-панель: управление категориями, эмодзи, трофеями, настройками сайта, сообщениями
- Полноценный роутинг (прямые ссылки на темы/профили/категории, назад/вперёд в браузере переживают обновление страницы)

## Структура проекта

```
backend/    Node.js + Express API (routes/controllers/middleware), lowdb (JSON-хранилище)
frontend/   React 18 + Vite + Tailwind, react-router-dom
```

## Запуск

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # заполните JWT_SECRET (см. комментарий в файле)
npm run dev
```

API будет доступен на http://localhost:3001

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Форум откроется на http://localhost:5173

Также доступны `INSTALL.bat` / `START.bat` для запуска в один клик на Windows — см. [ЗАПУСК.txt](ЗАПУСК.txt).

## Тестовый аккаунт

- **Логин:** admin_dev
- **Пароль:** admin123

## Тесты и линт

```bash
cd backend && npm test     # Vitest + supertest
cd frontend && npm test    # Vitest + React Testing Library
cd frontend && npm run lint
```

CI (GitHub Actions) прогоняет тесты, линт и сборку на каждый push/PR — см. `.github/workflows/ci.yml`.

## Известные ограничения / дальнейшие шаги

- `frontend/src/App.jsx` остаётся крупным координирующим компонентом (роутинг, часть состояния экранов). Листовые компоненты уже вынесены в `src/components/*`; следующий шаг — вынос оставшейся логики в отдельные хуки (`usePosts`, `useThread`, `useProfile`, `useChat`) и страницы (`pages/*`), чтобы `App.jsx` стал тонкой оболочкой.
- Хранилище данных — плоский JSON-файл (lowdb), подходит для разработки и небольших нагрузок; при росте нагрузки стоит рассмотреть переход на настоящую БД.
