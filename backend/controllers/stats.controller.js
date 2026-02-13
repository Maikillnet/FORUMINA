import db from '../db.js';

export function get(req, res) {
  const raw = db.stats.get();
  const bonusUsers = parseInt(db.system_settings.get('bonus_users') || '0', 10) || 0;
  const bonusMessages = parseInt(db.system_settings.get('bonus_messages') || '0', 10) || 0;
  const realUsers = raw.users;
  const realMessages = db.comments.getTotalCount();
  const displayUsers = realUsers + bonusUsers;
  const displayMessages = realMessages + bonusMessages;

  res.json({
    posts: raw.posts,
    users: raw.users,
    real_users: realUsers,
    display_users: displayUsers,
    real_messages: realMessages,
    display_messages: displayMessages,
  });
}

export function getLatestComments(req, res) {
  const comments = db.comments.getLatest(5);
  res.json(comments);
}
