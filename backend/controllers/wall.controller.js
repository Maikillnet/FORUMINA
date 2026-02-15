import db from '../db.js';
import { formatTime } from '../utils/formatTime.js';

export function list(req, res) {
  const posts = db.wall_posts.list(req.params.userId);
  const userId = req.user?.id;
  res.json(posts.map((p) => {
    const author = db.users.getById(p.author_id);
    const author_avatar = author?.custom_avatar || null;
    const pollVotes = db.wall_poll_votes.getVotes(p.id);
    const pollOptionsWithVotes = Array.isArray(p.poll_options) ? p.poll_options.map((text, i) => ({
      text,
      votes: pollVotes.filter((v) => v.option_index === i).length,
    })) : [];
    const pollUserVote = userId ? db.wall_poll_votes.getUserVote(p.id, userId) : null;
    const likes = db.wall_post_likes.getCount(p.id);
    const liked = userId ? db.wall_post_likes.hasLiked(userId, p.id) : false;
    const comments = db.wall_post_comments.list(p.id).map((c) => {
      const commentAuthor = db.users.getById(c.user_id);
      const author_avatar = commentAuthor?.custom_avatar || null;
      return { ...c, time: formatTime(c.created_at), author_avatar };
    });
    return {
      ...p,
      author_avatar,
      time: formatTime(p.created_at),
      poll_options_with_votes: pollOptionsWithVotes,
      poll_user_vote: pollUserVote,
      likes,
      liked,
      comments,
    };
  }));
}

export function create(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для публикации' });
  const { content, thread_id, thread_title, thread_image, images, poll_question, poll_options } = req.body;
  if (!content?.trim() && (!images?.length) && !poll_question?.trim() && !thread_id) return res.status(400).json({ error: 'Введите текст, прикрепите фото или добавьте голосование' });
  const author = db.users.getById(req.user.id);
  const wall = db.wall_posts.create(req.params.userId, req.user.id, author?.nickname || author?.username || 'user', (content || '').trim(), thread_id || null, thread_title || null, images || [], poll_question?.trim() || null, poll_options || null, thread_image || null);
  const author_avatar = author?.custom_avatar || null;
  const pollOptionsWithVotes = Array.isArray(wall.poll_options) ? wall.poll_options.map((text) => ({ text, votes: 0 })) : [];
  res.status(201).json({
    ...wall,
    author_avatar,
    time: formatTime(wall.created_at),
    poll_options_with_votes: pollOptionsWithVotes,
    poll_user_vote: null,
    likes: 0,
    liked: false,
    comments: [],
  });
}

export function addComment(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для комментария' });
  const { postId } = req.params;
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Введите текст' });
  const wall = (db.wall_posts.list(req.params.userId) || []).find((w) => String(w.id) === String(postId));
  if (!wall) return res.status(404).json({ error: 'Пост не найден' });
  const author = db.users.getById(req.user.id);
  const comment = db.wall_post_comments.create(postId, req.user.id, author?.nickname || author?.username || 'user', (content || '').trim());
  const author_avatar = author?.custom_avatar || null;
  res.status(201).json({ ...comment, time: formatTime(comment.created_at), author_avatar });
}

export function deleteComment(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для удаления' });
  const { userId, postId, commentId } = req.params;
  const wall = (db.wall_posts.list(userId) || []).find((w) => String(w.id) === String(postId));
  if (!wall) return res.status(404).json({ error: 'Пост не найден' });
  const comment = (db.wall_post_comments.list(postId) || []).find((c) => String(c.id) === String(commentId));
  if (!comment) return res.status(404).json({ error: 'Комментарий не найден' });
  const user = db.users.getById(req.user.id);
  const isAdmin = user?.is_admin === true;
  const isCommentAuthor = comment.user_id === req.user.id;
  const isWallOwner = wall.user_id === req.user.id;
  if (!isAdmin && !isCommentAuthor && !isWallOwner) return res.status(403).json({ error: 'Только автор комментария, владелец стены или администратор может удалить' });
  const ok = db.wall_post_comments.delete(commentId);
  if (!ok) return res.status(500).json({ error: 'Ошибка удаления' });
  res.json({ success: true });
}

export function votePoll(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для голосования' });
  const { postId } = req.params;
  const { option_index: optionIndex } = req.body;
  const wall = (db.wall_posts.list(req.params.userId) || []).find((w) => String(w.id) === String(postId));
  if (!wall) return res.status(404).json({ error: 'Пост не найден' });
  const opts = Array.isArray(wall.poll_options) ? wall.poll_options : [];
  if (optionIndex == null || optionIndex < 0 || optionIndex >= opts.length) return res.status(400).json({ error: 'Неверный вариант' });
  db.wall_poll_votes.vote(postId, req.user.id, parseInt(optionIndex));
  const pollVotes = db.wall_poll_votes.getVotes(postId);
  const pollOptionsWithVotes = opts.map((text, i) => ({
    text,
    votes: pollVotes.filter((v) => v.option_index === i).length,
  }));
  res.json({ poll_options_with_votes: pollOptionsWithVotes, poll_user_vote: parseInt(optionIndex) });
}

export function likePost(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для лайка' });
  const { postId } = req.params;
  const wall = (db.wall_posts.list(req.params.userId) || []).find((w) => String(w.id) === String(postId));
  if (!wall) return res.status(404).json({ error: 'Пост не найден' });
  const likes = db.wall_post_likes.toggle(req.user.id, postId);
  const liked = db.wall_post_likes.hasLiked(req.user.id, postId);
  res.json({ likes, liked });
}

export function update(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для редактирования' });
  const { postId } = req.params;
  const wall = (db.wall_posts.list(req.params.userId) || []).find((w) => String(w.id) === String(postId));
  if (!wall) return res.status(404).json({ error: 'Пост не найден' });
  const user = db.users.getById(req.user.id);
  const isAuthor = wall.author_id === req.user.id;
  const isAdmin = user?.is_admin === true;
  if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Только автор или администратор может редактировать' });
  const { content, images, poll_question, poll_options } = req.body;
  const data = {};
  if (content != null) data.content = String(content).trim();
  if (images != null) data.images = Array.isArray(images) ? images : [];
  if (poll_question !== undefined) data.poll_question = poll_question?.trim() || null;
  if (poll_options !== undefined) data.poll_options = Array.isArray(poll_options) ? poll_options : null;
  const updated = db.wall_posts.update(postId, data);
  if (!updated) return res.status(500).json({ error: 'Ошибка обновления' });
  const author = db.users.getById(updated.author_id);
  const author_avatar = author?.custom_avatar || null;
  const pollVotes = db.wall_poll_votes.getVotes(updated.id);
  const pollOptionsWithVotes = Array.isArray(updated.poll_options) ? updated.poll_options.map((text, i) => ({
    text,
    votes: pollVotes.filter((v) => v.option_index === i).length,
  })) : [];
  const pollUserVote = db.wall_poll_votes.getUserVote(updated.id, req.user.id);
  const likes = db.wall_post_likes.getCount(updated.id);
  const liked = db.wall_post_likes.hasLiked(req.user.id, updated.id);
  const comments = db.wall_post_comments.list(updated.id).map((c) => {
    const commentAuthor = db.users.getById(c.user_id);
    return { ...c, time: formatTime(c.created_at), author_avatar: commentAuthor?.custom_avatar || null };
  });
  res.json({
    ...updated,
    author_avatar,
    time: formatTime(updated.created_at),
    poll_options_with_votes: pollOptionsWithVotes,
    poll_user_vote: pollUserVote,
    likes,
    liked,
    comments,
  });
}

export function remove(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для удаления' });
  const { postId } = req.params;
  const wall = (db.wall_posts.list(req.params.userId) || []).find((w) => String(w.id) === String(postId));
  if (!wall) return res.status(404).json({ error: 'Пост не найден' });
  const user = db.users.getById(req.user.id);
  const isAuthor = wall.author_id === req.user.id;
  const isAdmin = user?.is_admin === true;
  if (!isAuthor && !isAdmin) return res.status(403).json({ error: 'Только автор или администратор может удалить' });
  const ok = db.wall_posts.delete(postId);
  if (!ok) return res.status(500).json({ error: 'Ошибка удаления' });
  res.json({ success: true });
}
