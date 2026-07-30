import { Crown } from 'lucide-react';
import { getRankColor } from '../../constants/ranks';
import { AvatarWithFallback } from './AvatarWithFallback';

export const UserBanner = ({ rank, color }) => {
  const c = color || getRankColor(rank);
  return (
    <span className={`text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded border border-white/10 bg-white/5 ${c} flex items-center gap-1`}>
      {(rank === 'Легенда' || rank === 'Legend') && <Crown size={8} />}
      {rank}
    </span>
  );
};

export const UserLink = ({ userId, username, avatarUrl, rank, rankColor, size = 'md', onClick }) => {
  const s = size === 'xs' ? 'w-6 h-6' : size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12';
  const handleClick = (e) => { e.stopPropagation(); onClick?.(userId); };
  const color = rankColor || getRankColor(rank);
  return (
    <button type="button" onClick={handleClick} className="flex items-center gap-2 hover:opacity-90 transition-opacity text-left group">
      <div className={`${s} rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-[var(--color-accent)]/30 transition-all`}>
        <AvatarWithFallback src={avatarUrl} alt={username} fallbackLetter={username} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-bold ${color} group-hover:text-[var(--color-accent)] transition-colors`}>{username}</span>
        {rank && <UserBanner rank={rank} color={color} />}
      </div>
    </button>
  );
};
