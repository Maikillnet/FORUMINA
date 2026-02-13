import db from '../db.js';
import { formatTime } from '../utils/formatTime.js';

function requireAuth(req, res) {
  if (!req.user) {
    res.status(401).json({ error: 'Войдите для отправки сообщений' });
    return false;
  }
  return true;
}

export function send(req, res) {
  if (!requireAuth(req, res)) return;
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content?.trim()) {
    return res.status(400).json({ error: 'Укажите senderId, receiverId и content' });
  }
  if (parseInt(senderId, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Можно отправлять только от своего имени' });
  }
  const msg = db.private_messages.create(parseInt(senderId, 10), parseInt(receiverId, 10), content.trim());
  db.users.update(parseInt(senderId, 10), { last_online: msg.timestamp });
  res.status(201).json({ ...msg, time: formatTime(msg.timestamp) });
}

export function getConversations(req, res) {
  if (!requireAuth(req, res)) return;
  const userId = parseInt(req.params.userId, 10);
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const convos = db.private_messages.getConversations(userId);
  const enriched = convos.map((c) => {
    const u = db.users.getById(c.contactId);
    return {
      contactId: c.contactId,
      id: c.contactId,
      username: u?.username || 'user',
      avatar: u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`,
      lastMessage: c.lastMessage,
      lastTime: formatTime(c.lastTime),
      last_online: u?.last_online ?? undefined, // ONLY user.last_online from DB. Never use chat.lastTime - that would show contact as "online" when current user sends a message
    };
  });
  res.json(enriched);
}

export function getHistory(req, res) {
  if (!requireAuth(req, res)) return;
  const userId = parseInt(req.params.userId, 10);
  const contactId = parseInt(req.params.contactId, 10);
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const messages = db.private_messages.getConversation(userId, contactId);
  res.json(messages.map((m) => ({ ...m, time: formatTime(m.timestamp), isMine: m.senderId === userId })));
}
