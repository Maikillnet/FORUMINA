import db, { RANKS } from '../db.js';
import { formatTime } from '../utils/formatTime.js';

export function updateProfile(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для изменения профиля' });
  const { username, avatar, cover, gender, occupation, interests } = req.body;
  const data = {};
  if (username != null) data.username = username;
  if (avatar !== undefined) data.avatar = avatar;
  if (cover !== undefined) {
    if (cover && typeof cover === 'string' && cover.length > 14 * 1024 * 1024) return res.status(400).json({ error: 'Обложка до 10 МБ' });
    data.cover = cover;
  }
  if (gender != null) data.gender = gender;
  if (occupation != null) data.occupation = occupation;
  if (interests != null) data.interests = interests;
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });
  const updated = db.users.update(req.user.id, data);
  if (!updated) {
    if (username && db.users.getByUsername(username.trim())) return res.status(400).json({ error: 'Никнейм уже занят' });
    return res.status(400).json({ error: 'Не удалось обновить профиль' });
  }
  const { password: _, ...safe } = updated;
  res.json(safe);
}

export function getById(req, res) {
  const id = req.params.id === 'me' && req.user ? req.user.id : parseInt(req.params.id);
  const profileUser = db.users.getById(id);
  if (!profileUser) return res.status(404).json({ error: 'Пользователь не найден' });
  const { password: _, email: __, ...safe } = profileUser;
  const postsCount = db.posts.getByAuthorId(profileUser.id, 1000).length;
  const commentsCount = db.comments.getCountByAuthor ? db.comments.getCountByAuthor(profileUser.id) : 0;
  const subscriptions = db.subscriptions.list(profileUser.id);
  const followers = db.subscriptions.followers(profileUser.id);
  const wallCount = (db.wall_posts.list(profileUser.id) || []).length;
  const isFollowing = req.user ? db.subscriptions.isFollowing(req.user.id, profileUser.id) : false;
  res.json({ ...safe, posts_count: postsCount, comments_count: commentsCount, subscriptions_count: subscriptions.length, followers_count: followers.length, wall_count: wallCount, is_following: isFollowing });
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
  const { password: _, ...safe } = updated;
  res.json(safe);
}

export function getPosts(req, res) {
  const posts = db.posts.getByAuthorId(req.params.id, 10);
  res.json(posts.map((p) => ({
    ...p,
    views: p.views >= 1000 ? (p.views / 1000).toFixed(1) + 'k' : String(p.views || 0),
    time: formatTime(p.updated_at),
  })));
}
