import { formatTimeAgo } from './time';

export const getAvatarUrl = (u) => u?.custom_avatar || u?.avatar || null;
export const getDisplayName = (u) => u?.nickname || u?.username || 'user';
// Centralizes the admin check that used to be copy-pasted (with a real risk
// of the copies drifting) in six different spots across App.jsx.
export const isAdmin = (u) => !!u && (u.is_admin === true || u.id === 1 || u.username === 'admin_dev');
export const isPlaceholderUrl = (url) => !url || typeof url !== 'string' || url.includes('unsplash') || url.includes('dicebear') || url.includes('placeholder') || url.includes('yandex');
export const getWallAvatarUrl = (u) => (u?.custom_avatar || u?.avatar) && !isPlaceholderUrl(u?.custom_avatar || u?.avatar) ? (u.custom_avatar || u.avatar) : null;

const FIVE_MINUTES = 5 * 60 * 1000;
// Status MUST use ONLY user.last_online. Never use chat.updatedAt, lastMessage timestamp, or new Date() fallback.
export const isOnline = (user) => {
  if (!user || !user.last_online) return false;
  const lastSeen = new Date(user.last_online).getTime();
  if (Number.isNaN(lastSeen)) return false;
  const diff = Date.now() - lastSeen;
  return diff < FIVE_MINUTES;
};

export const getUserStatus = (u) => {
  if (isOnline(u)) return { isOnline: true, label: 'В сети' };
  if (!u?.last_online) return { isOnline: false, label: 'Офлайн' };
  return { isOnline: false, label: `Был(а) в сети ${formatTimeAgo(u.last_online)}` };
};

export const getChatUserStatus = getUserStatus;
