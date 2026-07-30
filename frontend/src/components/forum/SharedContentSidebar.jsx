import { useState, useEffect } from 'react';
import { X, FileText, Download, Link, Copy, ExternalLink, Play, Video } from 'lucide-react';

export function SharedContentSidebar({ media, files, links, activeTab, onTabChange, searchQuery, onSearchChange, onClose, scrollToMessage }) {
  const [videoErrors, setVideoErrors] = useState(new Set());
  useEffect(() => { setVideoErrors(new Set()); }, [media]);
  const filterItems = (items, getText) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => getText(item).toLowerCase().includes(q));
  };
  const filteredMedia = filterItems(media, (m) => m.name || m.url || '');
  const filteredFiles = filterItems(files, (f) => f.name || f.url || '');
  const filteredLinks = filterItems(links, (l) => l.url || '');
  return (
    <aside className="w-80 border-l border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl flex flex-col animate-slideLeft shrink-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Вложения</h3>
        <button type="button" onClick={onClose} aria-label="Закрыть панель вложений" className="p-1 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск..."
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-accent)]/50"
        />
      </div>
      <div className="flex p-2 gap-1 bg-white/5 mx-2 rounded-lg">
        {['Медиа', 'Файлы', 'Ссылки'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === tab ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin-purple min-h-0">
        {activeTab === 'Медиа' && (
          <div className="grid grid-cols-3 gap-2">
            {filteredMedia.length === 0 ? (
              <p className="col-span-3 text-xs text-gray-500 py-4 text-center">Нет медиафайлов</p>
            ) : (
              filteredMedia.map((item, i) => {
                const mediaKey = `${item.messageId}-${i}`;
                const videoFailed = videoErrors.has(mediaKey);
                return (
                <div
                  key={mediaKey}
                  role="button"
                  tabIndex={0}
                  className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-[var(--color-accent)]/50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.messageId && scrollToMessage) {
                      scrollToMessage(item.messageId);
                      onClose?.();
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToMessage?.(item.messageId); onClose?.(); } }}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  ) : item.type === 'video' && !videoFailed ? (
                    <>
                      <video
                        src={`${item.url}#t=0.5`}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={() => setVideoErrors((prev) => new Set([...prev, mediaKey]))}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-all pointer-events-none">
                        <Play size={20} className="text-white drop-shadow-md" fill="currentColor" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/60 text-[10px] px-1.5 py-0.5 rounded text-white pointer-events-none">
                        <Video size={10} className="inline mr-0.5 align-middle" />
                        Видео
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <Video size={24} className="text-[var(--color-accent)]" />
                    </div>
                  )}
                </div>
              ); })
            )}
          </div>
        )}
        {activeTab === 'Файлы' && (
          <div className="space-y-2">
            {filteredFiles.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">Нет файлов</p>
            ) : (
              filteredFiles.map((item, i) => (
                <div
                  key={`${item.messageId}-${i}`}
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.messageId && scrollToMessage) {
                      scrollToMessage(item.messageId);
                      onClose?.();
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToMessage?.(item.messageId); onClose?.(); } }}
                >
                  <FileText size={20} className="text-[var(--color-accent)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''}</p>
                  </div>
                  <a href={item.url} download={item.name} onClick={(e) => e.stopPropagation()} className="p-1.5 text-gray-500 hover:text-white transition-colors shrink-0" title="Скачать">
                    <Download size={14} />
                  </a>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'Ссылки' && (
          <div className="space-y-2">
            {filteredLinks.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">Нет ссылок</p>
            ) : (
              filteredLinks.map((item, i) => (
                <div
                  key={`${item.messageId}-${i}`}
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.messageId && scrollToMessage) {
                      scrollToMessage(item.messageId);
                      onClose?.();
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToMessage?.(item.messageId); onClose?.(); } }}
                >
                  <Link size={16} className="text-[var(--color-accent)] shrink-0" />
                  <span className="flex-1 text-sm text-[var(--color-accent)] truncate">{item.url}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.url); }}
                    className="p-1.5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded"
                    title="Копировать"
                  >
                    <Copy size={14} />
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded" title="Открыть в новой вкладке">
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
