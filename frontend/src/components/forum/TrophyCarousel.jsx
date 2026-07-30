import { useRef } from 'react';
import { Trophy } from 'lucide-react';

export function TrophyCarousel({ trophies, emptyMessage = 'Нет трофеев', bgGradientFrom = '#222' }) {
  const scrollRef = useRef(null);
  const onWheel = (e) => {
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (scrollRef.current) scrollRef.current.scrollLeft += e.deltaY || e.deltaX;
    }
  };
  if (!trophies?.length) return <p className="text-[#666] text-sm">{emptyMessage}</p>;
  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div
        ref={scrollRef}
        onWheel={onWheel}
        className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trophies.map((t) => (
          <div
            key={t.id}
            className="relative flex flex-col items-center flex-shrink-0 w-24 snap-center transition-all duration-200 ease-out hover:scale-110 hover:z-50 hover:drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)] cursor-default"
            title={t.description || t.name}
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-transparent border border-[#404040] flex items-center justify-center ring-2 ring-transparent hover:ring-[var(--color-accent)]/40 transition-all">
              {t.image_url ? <img src={t.image_url} alt={t.name} className="w-full h-full object-contain" /> : <Trophy size={28} className="text-[var(--color-accent)]" />}
            </div>
            <span className="text-[10px] text-[#888] font-bold uppercase mt-1.5 text-center text-xs break-words leading-tight w-full">{t.name}</span>
          </div>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-6 w-12 pointer-events-none" style={{ background: `linear-gradient(to left, ${bgGradientFrom}, transparent)` }} aria-hidden />
    </div>
  );
}
