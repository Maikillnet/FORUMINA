import { useEffect } from 'react';

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(), 3500);
    return () => clearTimeout(t);
  }, [message, type]);
  return (
    <div className={`fixed bottom-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-xl border ${
      type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
    }`}>
      {message}
    </div>
  );
}
