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
  const { content, thread_id, thread_title, images, poll_question, poll_options } = req.body;
  if (!content?.trim() && (!images?.length) && !poll_question?.trim()) return res.status(400).json({ error: 'Введите текст, прикрепите фото или добавьте голосование' });
  const author = db.users.getById(req.user.id);
  const wall = db.wall_posts.create(req.params.userId, req.user.id, author?.username || 'user', (content || '').trim(), thread_id || null, thread_title || null, images || [], poll_question?.trim() || null, poll_options || null);
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
  const comment = db.wall_post_comments.create(postId, req.user.id, author?.username || 'user', (content || '').trim());
  const author_avatar = author?.custom_avatar || null;
  res.status(201).json({ ...comment, time: formatTime(comment.created_at), author_avatar });
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
