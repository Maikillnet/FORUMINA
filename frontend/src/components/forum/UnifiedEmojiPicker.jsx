export function UnifiedEmojiPicker({ emojis, onSelect, open, onClose, className }) {
  if (!open) return null;
  const list = emojis || [];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        className={`emoji-picker-enter absolute bottom-full left-0 mb-3 z-50 w-72 h-64 overflow-hidden rounded-2xl bg-black/60 backdrop-blur-xl border border-[var(--color-accent)]/20 shadow-2xl shadow-[var(--color-accent)]/5 transition-all duration-200 ease-out ${className || ''}`}
      >
        <div className="grid grid-cols-6 gap-2 p-3 h-full overflow-y-auto overflow-x-hidden scrollbar-picker">
          {list.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                const insert = e.type === 'unicode' ? e.value : (e.code || `:${e.name}:`);
                onSelect?.(insert, e.type);
                onClose?.();
              }}
              className="aspect-square flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/10 hover:scale-110 hover:shadow-[0_0_10px_-5px_var(--color-accent)] transition-all duration-200 cursor-pointer"
              title={e.code}
            >
              {e.type === 'unicode' ? (
                <span className="text-2xl">{e.value}</span>
              ) : (
                <img src={e.value} alt="" className="w-8 h-8 object-contain drop-shadow-sm" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
