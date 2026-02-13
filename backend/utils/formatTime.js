export function formatTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const diff = (Date.now() - d) / 60000;
  if (diff < 1) return 'только что';
  if (diff < 60) return `${Math.floor(diff)} мин. назад`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ч. назад`;
  if (diff < 43200) return `${Math.floor(diff / 1440)} дн. назад`;
  return d.toLocaleDateString('ru');
}
