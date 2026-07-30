export const RANKS = [
  { id: 'Юзер', color: 'text-slate-400' },
  { id: 'Боец', color: 'text-blue-400' },
  { id: 'Хранитель', color: 'text-cyan-400' },
  { id: 'Модератор', color: 'text-purple-400' },
  { id: 'Поверенный', color: 'text-amber-400' },
  { id: 'Легенда', color: 'text-orange-400' },
];

export const displayRank = (r) => (r === 'User' ? 'Юзер' : r === 'Legend' ? 'Легенда' : r || 'Юзер');

export const getRankColor = (rank) => RANKS.find(r => r.id === rank)?.color || 'text-slate-400';

export const RANK_GLOW = {
  'Юзер': { hex: '#94a3b8', rgba: 'rgba(148,163,184,0.5)' },
  'Боец': { hex: '#60a5fa', rgba: 'rgba(96,165,250,0.6)' },
  'Хранитель': { hex: '#22d3ee', rgba: 'rgba(34,211,238,0.6)' },
  'Модератор': { hex: '#a78bfa', rgba: 'rgba(167,139,250,0.6)' },
  'Поверенный': { hex: '#fbbf24', rgba: 'rgba(251,191,36,0.6)' },
  'Легенда': { hex: '#f97316', rgba: 'rgba(249,115,22,0.6)' },
  'default': { hex: 'var(--color-accent)', rgba: 'rgba(168,85,247,0.5)' },
};

export const getAvatarGlowStyles = (rank) => {
  const r = displayRank(rank);
  const glow = RANK_GLOW[r] || RANK_GLOW.default;
  return { borderColor: glow.hex, boxShadow: `0 0 30px ${glow.rgba}` };
};
