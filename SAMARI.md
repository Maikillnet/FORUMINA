# SAMARI — Саммари для разработки FORUM.LIVE

> Документ для доработки и разработки функций. Ревизия перед каждым новым этапом.

---

## 1. Текущая архитектура

### Backend (Node.js + Express)
```
backend/
├── server.js          # Монолитный entry point — ТРЕБУЕТ РАЗДЕЛЕНИЯ
├── db.js              # Инициализация БД
└── package.json
```

### Frontend (React + Vite)
```
frontend/src/
├── App.jsx            # 666 строк — МОНОЛИТ, ТРЕБУЕТ РАЗДЕЛЕНИЯ
├── api.js             # API клиент
├── main.jsx
└── index.css
```

### Проблемы текущей архитектуры
- [ ] **App.jsx** — 20+ useState, вся логика в одном файле, невозможна переиспользование
- [ ] **server.js** — все роуты и логика в одном файле
- [ ] Нет разделения: constants / utils / types
- [ ] Нет Context для auth — props drilling
- [ ] Нет error boundary
- [ ] Нет валидации на backend (express-validator)
- [ ] SQL injection риск в search (параметризация)
- [ ] JWT_SECRET в коде — вынести в .env

---

## 2. Целевая архитектура

### Backend (после рефакторинга)
```
backend/
├── server.js              # Только app mount + listen
├── config/
│   └── index.js           # PORT, JWT_SECRET, CORS_ORIGIN
├── middleware/
│   └── auth.js            # authMiddleware
├── routes/
│   ├── index.js            # Роутеры
│   ├── auth.routes.js
│   ├── posts.routes.js
│   ├── categories.routes.js
│   └── search.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── posts.controller.js
│   ├── categories.controller.js
│   └── search.controller.js
├── services/               # Опционально: бизнес-логика
├── utils/
│   └── formatTime.js
├── db.js
└── package.json
```

### Frontend (после рефакторинга)
```
frontend/src/
├── main.jsx
├── App.jsx                # Только layout + routing
├── api/
│   └── client.js          # Базовый fetch + auth
├── api/
│   ├── auth.api.js
│   ├── posts.api.js
│   ├── comments.api.js
│   └── search.api.js
├── constants/
│   ├── themes.js
│   ├── categories.js
│   └── navigation.js
├── context/
│   └── AuthContext.jsx    # user, login, logout, isAuthenticated
├── hooks/
│   ├── useAuth.js
│   ├── usePosts.js
│   ├── useThread.js
│   └── useSearch.js
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── TopBar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MobileNav.jsx
│   │   └── Layout.jsx
│   ├── forum/
│   │   ├── PostCard.jsx
│   │   ├── PostList.jsx
│   │   ├── ThreadView.jsx
│   │   ├── CommentForm.jsx
│   │   └── CommentList.jsx
│   ├── editor/
│   │   └── PostEditor.jsx
│   ├── auth/
│   │   └── AuthModal.jsx
│   ├── profile/
│   │   └── ProfileView.jsx
│   └── ui/
│       ├── UserBanner.jsx
│       ├── Avatar.jsx
│       └── PlusIcon.jsx
├── pages/
│   ├── FeedPage.jsx
│   ├── ThreadPage.jsx
│   ├── EditorPage.jsx
│   ├── ProfilePage.jsx
│   ├── RulesPage.jsx
│   └── ArticlesPage.jsx
├── utils/
│   └── (при необходимости)
└── index.css
```

---

## 3. Чек-лист рефакторинга

### Backend
- [ ] Вынести config в `config/index.js`
- [ ] Создать `middleware/auth.js`
- [ ] Разделить routes: auth, posts, categories, search, stats
- [ ] Создать controllers для каждой группы
- [ ] Вынести `formatTime` в utils
- [ ] Добавить `.env.example` с JWT_SECRET, PORT
- [ ] **Исправить SQL injection** в search — параметризовать LIKE
- [ ] Добавить валидацию body (express-validator или joi)

### Frontend
- [ ] Создать `AuthContext` + `useAuth`
- [ ] Вынести constants: theme, CATEGORIES, TOP_NAV, POST_CATEGORIES
- [ ] Разбить App на Layout + страницы
- [ ] Создать компоненты: Header, Sidebar, PostCard, ThreadView, AuthModal, etc.
- [ ] Создать hooks: usePosts, useThread, useSearch
- [ ] Разделить api на модули
- [ ] Добавить ErrorBoundary
- [ ] Заменить `alert()` на toast/notification компонент

---

## 4. Известные ошибки и TODO

### Исправлено (2025-02-12)
- ✅ **formatTime** — добавлена проверка на некорректную дату (NaN)
- ✅ **Toast** — стабилизированы зависимости useEffect, таймер не сбрасывается при ре-рендере
- ✅ **setSelectedThread** — исправлена передача null при vote (prev ? { ...prev, votes } : null)
- ✅ **getByAuthor** — удалён мёртвый код из posts.controller (используется users.getPosts)
- ✅ **Регистрация** — добавлена валидация формата email
- ✅ **Поиск** — добавлен debounce 300ms для снижения нагрузки
- ✅ **@tailwindcss/typography** — добавлен плагин для корректного prose-рендеринга

### Критичные (остаются)
1. **JWT_SECRET** захардкожен — обязателен .env в production
2. **lowdb** — search не использует SQL, инъекций нет (JSON-фильтрация)

### Средние
3. **loadStats** вызывается с `posts.length` в deps — избыточные запросы
4. **Версия голосов** — votes state не синхронизируется с сервером при загрузке (user vote state)
5. **Нет обработки 401** при истёкшем токене — silent fail

### Низкие
6. **Аватар** — dicebear URL может быть недоступен (офлайн)
7. **npm install** — выполнить в frontend для установки @tailwindcss/typography

---

## 5. Планируемые функции (backlog)

### Приоритет 1
- [ ] Редактирование своего поста/комментария
- [ ] Удаление своего поста/комментария
- [ ] Страница пользователя (публичный профиль)
- [ ] Подписки на темы (filter subs)

### Приоритет 2
- [ ] Markdown preview в редакторе
- [ ] Пагинация постов
- [ ] Rate limiting на API
- [ ] Refresh token

### Приоритет 3
- [ ] Уведомления
- [ ] Теги к постам
- [ ] Модерация (pin, delete)
- [ ] Логирование запросов

---

## 6. Контроль качества

### Перед коммитом
- [ ] ESLint без ошибок
- [ ] Нет console.log в production коде
- [ ] Секреты не в репозитории
- [ ] Все импорты используются

### Перед мержем
- [ ] Ручная проверка: auth, create post, comment, vote
- [ ] Проверка mobile layout
- [ ] Проверка при отключённом backend

---

## 7. Ревизия

| Дата | Изменения |
|------|-----------|
| 2025-02-12 | Создан SAMARI, начат рефакторинг |
