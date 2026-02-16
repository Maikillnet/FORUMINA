import bcrypt from 'bcryptjs';
import db, { RANKS } from '../db.js';
import { formatTime } from '../utils/formatTime.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';

export async function updateProfile(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для изменения профиля' });
  const user = db.users.getById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
  const { username, nickname, avatar, cover, gender, occupation, interests, settings } = req.body;
  const data = {};
  if (username != null) data.username = username;
  if (nickname != null) data.nickname = nickname;
  if (avatar !== undefined) data.avatar = avatar;
  if (settings !== undefined) {
    const { openai_key: _omit, ...settingsWithoutKey } = settings;
    data.settings = { ...(user.settings || {}), ...settingsWithoutKey };
    if (user.settings?.openai_key != null) data.settings.openai_key = user.settings.openai_key;
  }
  if (cover !== undefined) {
    if (cover && typeof cover === 'string' && cover.length > 14 * 1024 * 1024) return res.status(400).json({ error: 'Обложка до 10 МБ' });
    data.cover = cover;
  }
  if (gender != null) data.gender = gender;
  if (occupation != null) data.occupation = occupation;
  if (interests != null) data.interests = interests;
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });
  const updated = await db.users.update(req.user.id, data);
  if (!updated) {
    if (username && db.users.getByUsername(username.trim())) return res.status(400).json({ error: 'Логин уже занят. Используйте только латиницу, цифры и _' });
    return res.status(400).json({ error: 'Не удалось обновить профиль' });
  }
  res.json(sanitizeUser(updated));
}

export function getById(req, res) {
  const id = req.params.id === 'me' && req.user ? req.user.id : parseInt(req.params.id);
  const profileUser = db.users.getById(id);
  if (!profileUser) return res.status(404).json({ error: 'Пользователь не найден' });
  const safe = sanitizeUser(profileUser);
  const postsCount = db.posts.getByAuthorId(profileUser.id, 1000).length;
  const commentsCount = db.comments.getCountByAuthor ? db.comments.getCountByAuthor(profileUser.id) : 0;
  const subscriptions = db.subscriptions.list(profileUser.id);
  const followers = db.subscriptions.followers(profileUser.id);
  const wallCount = (db.wall_posts.list(profileUser.id) || []).length;
  const isFollowing = req.user ? db.subscriptions.isFollowing(req.user.id, profileUser.id) : false;
  const messageAccess = profileUser?.settings?.privacy?.message_access || 'all';
  const canMessage = messageAccess === 'none' ? false : (messageAccess === 'all' ? true : !!(req.user && db.subscriptions.isFollowing(profileUser.id, req.user.id)));
  res.json({ ...safe, posts_count: postsCount, comments_count: commentsCount, subscriptions_count: subscriptions.length, followers_count: followers.length, wall_count: wallCount, is_following: isFollowing, message_access: messageAccess, can_message: canMessage });
}

export function getSubscriptions(req, res) {
  const list = db.subscriptions.list(req.params.id);
  res.json(list);
}

export function getFollowers(req, res) {
  const list = db.subscriptions.followers(req.params.id);
  res.json(list);
}

export function toggleFollow(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для подписки' });
  const targetId = parseInt(req.params.id);
  const target = db.users.getById(targetId);
  if (!target) return res.status(404).json({ error: 'Пользователь не найден' });
  const result = db.subscriptions.toggle(req.user.id, targetId);
  res.json(result);
}

export function getActivityFeed(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для просмотра ленты' });
  const items = db.activity_log.getFeedForFollowers(req.user.id, 50);
  const withTime = items.map((item) => ({ ...item, time: formatTime(item.created_at) }));
  res.json(withTime);
}

export function setRank(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Только администратор может менять звания' });
  const target = db.users.getById(parseInt(req.params.id));
  if (!target) return res.status(404).json({ error: 'Пользователь не найден' });
  const { rank } = req.body;
  if (!RANKS.find((r) => r.id === rank)) return res.status(400).json({ error: 'Недопустимое звание' });
  const updated = db.users.setRank(req.user.id, parseInt(req.params.id), rank);
  res.json(sanitizeUser(updated));
}

export async function updateSettings(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для изменения настроек' });
  const { username, nickname, currentPassword, newPassword, confirmPassword, settings } = req.body;
  const data = {};
  const user = db.users.getById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Пользователь не найден' });

  const usernameChanged = username != null && String(username).trim().toLowerCase() !== (user.username || '').toLowerCase();
  const nicknameChanged = nickname !== undefined && String(nickname).trim() !== (user.nickname || '');
  const needsPassword = usernameChanged || nicknameChanged || newPassword || confirmPassword;
  if (needsPassword && !currentPassword) return res.status(400).json({ error: 'Укажите текущий пароль для подтверждения' });
  if (needsPassword && currentPassword && !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Старый пароль неверный' });
  }

  if (username != null) {
    const trimmed = String(username).trim().toLowerCase();
    if (trimmed.length < 2) return res.status(400).json({ error: 'Логин минимум 2 символа' });
    if (!/^[a-z0-9_]+$/.test(trimmed)) return res.status(400).json({ error: 'Логин: только a-z, 0-9 и _' });
    const existing = db.users.getByUsername(trimmed);
    if (existing && existing.id !== req.user.id) return res.status(409).json({ error: 'Этот логин уже занят' });
    data.username = trimmed;
  }
  if (nickname !== undefined) data.nickname = String(nickname).trim();

  if (newPassword || confirmPassword) {
    if (!currentPassword) return res.status(400).json({ error: 'Укажите текущий пароль' });
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Старый пароль неверный' });
    }
    if (!newPassword || !confirmPassword) return res.status(400).json({ error: 'Заполните новый пароль и подтверждение' });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Пароли не совпадают' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Новый пароль минимум 4 символа' });
    data.password = bcrypt.hashSync(newPassword, 10);
  }

  if (settings !== undefined) {
    data.settings = { ...(user.settings || {}) };
    if (settings.openai_key !== undefined) {
      const rawKey = typeof settings.openai_key === 'string' ? settings.openai_key.trim() : '';
      const keyVal = rawKey || null;
      const reqUsername = (req.body.username ?? user?.username ?? '').toString().trim().toLowerCase();
      const isLikelyUsername = keyVal && (keyVal === reqUsername || keyVal === (user?.nickname || '').toString().trim());
      const looksLikeApiKey = keyVal && /^sk(-|_)[a-zA-Z0-9_-]+/.test(keyVal);
      const isShortAndMatchesUsername = keyVal && keyVal.length < 20 && keyVal === reqUsername;
      if (keyVal && (isLikelyUsername && !looksLikeApiKey || isShortAndMatchesUsername)) {
        return res.status(400).json({ error: 'Ключ AI не может совпадать с логином. Введите корректный OpenAI API ключ (начинается с sk-).' });
      }
      data.settings.openai_key = keyVal;
    }
    if (settings.privacy !== undefined) {
      data.settings.privacy = { ...(user.settings?.privacy || {}), ...settings.privacy };
    }
  }

  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });
  const updated = await db.users.update(req.user.id, data);
  if (!updated) return res.status(400).json({ error: 'Не удалось обновить настройки' });

  res.json(sanitizeUser(updated));
}

export async function changePassword(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для смены пароля' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Укажите текущий и новый пароль' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'Новый пароль минимум 4 символа' });
  }
  const user = db.users.getById(req.user.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Неверный текущий пароль' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  await db.users.update(req.user.id, { password: hash });
  const freshUser = db.users.getById(req.user.id);
  res.json({ message: 'Пароль изменён', user: sanitizeUser(freshUser) });
}

export function getPosts(req, res) {
  const posts = db.posts.getByAuthorId(req.params.id, 10);
  res.json(posts.map((p) => ({
    ...p,
    views: p.views >= 1000 ? (p.views / 1000).toFixed(1) + 'k' : String(p.views || 0),
    time: formatTime(p.updated_at),
  })));
}
