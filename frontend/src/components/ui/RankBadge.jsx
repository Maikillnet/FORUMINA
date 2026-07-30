import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { RANKS, RANK_GLOW, displayRank, getRankColor } from '../../constants/ranks';

export function RankBadge({ currentRank, currentColor, isAdmin, onRankChange, loading, glow = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const rank = displayRank(currentRank);
  const color = currentColor || getRankColor(rank);
  const glowStyles = glow ? { textShadow: `0 0 12px ${(RANK_GLOW[rank] || RANK_GLOW.default).rgba}` } : {};
  if (!isAdmin) {
    return (
      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--bg-main)] border border-current ${color}`} style={glowStyles}>
        {rank}
      </span>
    );
  }
  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--bg-main)] border border-current ${color} hover:border-[var(--color-accent)]/50 hover:bg-[#1c2128] transition-colors cursor-pointer disabled:opacity-50 select-none`}
        style={glowStyles}
      >
        {rank}
        <ChevronDown size={10} className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[120px] bg-[var(--bg-block)] border border-[#30363d] rounded-lg shadow-xl overflow-hidden">
          {RANKS.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={async () => {
                setOpen(false);
                const equiv = (a, b) => a === b || (a === 'User' && b === 'Юзер') || (a === 'Legend' && b === 'Легенда');
                if (equiv(currentRank, r.id)) return;
                try {
                  await onRankChange(r.id);
                } catch {}
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-[#1c2128] transition-colors ${r.color}`}
            >
              {r.id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
