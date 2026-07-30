import { useState, useEffect, useCallback } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageViewer({ images, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex ?? 0);

  useEffect(() => setIndex(initialIndex ?? 0), [initialIndex]);

  const next = useCallback((e) => { e?.stopPropagation(); setIndex((i) => (i + 1) % images.length); }, [images.length]);
  const prev = useCallback((e) => { e?.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length); }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, onClose]);

  if (!images?.length) return null;
  const currentSrc = images[index];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-200" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Закрыть просмотр изображения" className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all z-50">
        <X size={24} />
      </button>
      <a href={currentSrc} download target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute top-4 right-16 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all z-50" title="Скачать">
        <Download size={24} />
      </a>
      {images.length > 1 && (
        <>
          <button type="button" onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all z-50">
            <ChevronLeft size={32} />
          </button>
          <button type="button" onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all z-50">
            <ChevronRight size={32} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/50 rounded-full text-white/80 text-sm font-medium backdrop-blur-sm">
            {index + 1} / {images.length}
          </div>
        </>
      )}
      <img key={currentSrc} src={currentSrc} alt="Full view" className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
