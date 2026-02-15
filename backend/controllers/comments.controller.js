import db from '../db.js';
import { formatTime } from '../utils/formatTime.js';

export function list(req, res) {
  const comments = db.comments.list(req.params.id);
  res.json(comments.map((c) => {
    const likes = db.comment_likes.getCount(c.id);
    const liked = req.user ? db.comment_likes.hasLiked(req.user.id, c.id) : false;
    return { ...c, time: formatTime(c.created_at), likes, liked };
  }));
}

export function create(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для комментариев' });
  const { content, image, images, parentId } = req.body;
  const imagesArr = Array.isArray(images) ? images : (image ? [image] : []);
  if (!content?.trim() && imagesArr.length === 0) return res.status(400).json({ error: 'Введите текст или прикрепите фото' });
  const comment = db.comments.create(req.params.id, req.user.id, (content || '').trim(), imagesArr, parentId || null);
  const likes = db.comment_likes.getCount(comment.id);
  res.status(201).json({ ...comment, time: formatTime(comment.created_at), likes: 0, liked: false });
}

export function like(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для лайка' });
  const count = db.comment_likes.toggle(req.user.id, req.params.commentId);
  res.json({ likes: count });
}

export function update(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для редактирования' });
  const comments = db.comments.list(req.params.id);
  const comment = comments.find((c) => String(c.id) === String(req.params.commentId));
  if (!comment) return res.status(404).json({ error: 'Комментарий не найден' });
  const user = db.users.getById(req.user.id);
  const isAuthor = comment.author_id === req.user.id;
  const isAdmin = user?.is_admin === true;
  if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Только автор или администратор может редактировать' });
  const { content, images } = req.body;
  const data = {};
  if (content != null) data.content = (content || '').trim();
  if (images != null) data.images = Array.isArray(images) ? images : (images ? [images] : []);
  const updated = db.comments.update(req.params.commentId, data);
  if (!updated) return res.status(500).json({ error: 'Ошибка обновления' });
  const u = db.users.getById(updated.author_id);
  const authorAvatar = u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`;
  const likes = db.comment_likes.getCount(updated.id);
  const liked = db.comment_likes.hasLiked(req.user.id, updated.id);
  res.json({ ...updated, author: u?.nickname || u?.username, author_avatar: authorAvatar, time: formatTime(updated.created_at), likes, liked });
}

export function remove(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для удаления' });
  const comments = db.comments.list(req.params.id);
  const comment = comments.find((c) => String(c.id) === String(req.params.commentId));
  if (!comment) return res.status(404).json({ error: 'Комментарий не найден' });
  const user = db.users.getById(req.user.id);
  const isAuthor = comment.author_id === req.user.id;
  const isAdmin = user?.is_admin === true;
  if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Только автор или администратор может удалить' });
  const ok = db.comments.delete(req.params.commentId);
  if (!ok) return res.status(500).json({ error: 'Ошибка удаления' });
  res.json({ success: true });
}
