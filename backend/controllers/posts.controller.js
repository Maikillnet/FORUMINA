import db from '../db.js';
import { formatTime } from '../utils/formatTime.js';

function requireAdmin(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Только администратор может управлять постами' });
  return null;
}

export function list(req, res) {
  const { category, filter } = req.query;
  const posts = db.posts.list(category, filter);
  res.json(posts.map((p) => ({
    ...p,
    views: p.views >= 1000 ? (p.views / 1000).toFixed(1) + 'k' : String(p.views || 0),
    time: formatTime(p.updated_at),
  })));
}

export function getById(req, res) {
  const post = db.posts.getById(req.params.id, req.user?.id);
  if (!post) return res.status(404).json({ error: 'Тема не найдена' });
  db.posts.incrementViews(req.params.id);
  post.views = (post.views || 0) + 1;
  const replies = db.posts.getRepliesCount(req.params.id);
  res.json({ ...post, replies, time: formatTime(post.updated_at) });
}

export function create(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для создания тем' });
  const { title, content, category, tags, images } = req.body;
  if (!title || !content || !category) return res.status(400).json({ error: 'Заполните все поля' });
  const imagesArr = Array.isArray(images) ? images : (images ? [images] : []);
  const post = db.posts.create(title, content, category, req.user.id, tags || '', imagesArr);
  const user = db.users.getById(post.author_id);
  res.status(201).json({ ...post, author: user?.username, rank: user?.rank, rank_color: user?.rank_color });
}

export function vote(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для голосования' });
  const { vote } = req.body;
  if (vote !== 1 && vote !== -1) return res.status(400).json({ error: 'Неверный голос' });
  const votes = db.posts.vote(req.user.id, req.params.id, vote);
  res.json({ votes });
}

export function like(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для лайка' });
  const likes = db.post_likes.toggle(req.user.id, req.params.id);
  res.json({ likes, liked: db.post_likes.hasLiked(req.user.id, req.params.id) });
}

export function listAdminPosts(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const list = db.posts.list('all');
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = Math.min(parseInt(req.query.perPage, 10) || 20, 100);
  const start = (page - 1) * perPage;
  const total = list.length;
  const items = list.slice(start, start + perPage).map((p) => ({
    ...p,
    time: formatTime(p.updated_at),
    content_preview: (p.content || '').substring(0, 120) + ((p.content || '').length > 120 ? '…' : ''),
  }));
  res.json({ items, total, page, perPage });
}

export function deleteAdminPost(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const ok = db.posts.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Пост не найден' });
  res.json({ success: true });
}
