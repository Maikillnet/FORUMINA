# FORUM.LIVE — Developers

Современный форум с тёмной темой в стиле GitHub.

## Структура проекта

- `backend/` — Node.js + Express API
- `frontend/` — React + Vite + Tailwind

## Запуск

### 1. Backend

```bash
cd backend
npm install
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

## Тестовый аккаунт

- **Логин:** admin_dev
- **Пароль:** admin123

## Возможности

- Регистрация и вход (JWT)
- Создание тем и комментариев
- Голосование за темы
- Поиск по темам
- Разделы: Backend, Frontend, DevOps, Languages, Security, Career
- Адаптивный дизайн
