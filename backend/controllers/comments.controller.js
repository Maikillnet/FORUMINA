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
