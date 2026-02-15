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
  const { senderId, receiverId, content, attachments } = req.body;
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Укажите senderId и receiverId' });
  }
  const hasContent = content?.trim();
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  if (!hasContent && !hasAttachments) {
    return res.status(400).json({ error: 'Укажите content или прикрепите файл' });
  }
  if (parseInt(senderId, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Можно отправлять только от своего имени' });
  }
  const msg = db.private_messages.create(parseInt(senderId, 10), parseInt(receiverId, 10), (content || '').trim(), attachments || []);
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
      username: u?.nickname || u?.username || 'user',
      avatar: u?.custom_avatar || u?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`,
      last_online: u?.last_online ?? undefined,
      lastMessage: c.lastMessage,
      lastTime: formatTime(c.lastTime),
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
  res.json(messages.map((m) => ({ ...m, time: formatTime(m.timestamp), isMine: m.senderId === userId, is_pinned: m.is_pinned ?? false })));
}

export function getAttachments(req, res) {
  if (!requireAuth(req, res)) return;
  const userId = parseInt(req.params.userId, 10);
  const contactId = parseInt(req.params.contactId, 10);
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  const data = db.private_messages.getAttachments(userId, contactId);
  res.json(data);
}

export function deleteMessage(req, res) {
  if (!requireAuth(req, res)) return;
  const messageId = parseInt(req.params.id, 10);
  const msg = db.private_messages.getById(messageId);
  if (!msg) return res.status(404).json({ error: 'Сообщение не найдено' });
  if (msg.senderId !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({ error: 'Вы не можете удалить чужое сообщение' });
  }
  const ok = db.private_messages.delete(messageId, req.user.id, req.user.is_admin);
  if (!ok) return res.status(500).json({ error: 'Ошибка удаления' });
  res.json({ success: true });
}

export function togglePinMessage(req, res) {
  if (!requireAuth(req, res)) return;
  const messageId = parseInt(req.params.id, 10);
  const msg = db.private_messages.getById(messageId);
  if (!msg) return res.status(404).json({ error: 'Сообщение не найдено' });
  if (msg.senderId !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({ error: 'Только автор или администратор может закреплять сообщения' });
  }
  const updated = db.private_messages.togglePin(messageId, req.user.id, req.user.is_admin);
  if (!updated) return res.status(500).json({ error: 'Ошибка закрепления' });
  res.json({ ...updated, time: formatTime(updated.timestamp) });
}

export function unpinMessage(req, res) {
  if (!requireAuth(req, res)) return;
  const messageId = parseInt(req.params.id, 10);
  const msg = db.private_messages.getById(messageId);
  if (!msg) return res.status(404).json({ error: 'Сообщение не найдено' });
  if (msg.senderId !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({ error: 'Только автор или администратор может откреплять сообщения' });
  }
  const updated = db.private_messages.unpin(messageId, req.user.id, req.user.is_admin);
  if (!updated) return res.status(500).json({ error: 'Ошибка открепления' });
  res.json({ success: true, ...updated, time: formatTime(updated.timestamp) });
}
