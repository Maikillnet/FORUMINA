export const formatTimeAgo = (timestamp) => {
  const sec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (sec < 60) return 'только что';
  if (sec < 3600) return `${Math.floor(sec / 60)} мин назад`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ч назад`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} дн назад`;
  if (sec < 2592000) return `${Math.floor(sec / 604800)} нед назад`;
  return `${Math.floor(sec / 2592000)} мес назад`;
};
