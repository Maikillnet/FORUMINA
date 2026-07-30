import { useState, useEffect, useRef } from 'react';
import { Heart, Share2, Link, Repeat2, Pencil, Trash2 } from 'lucide-react';
import * as api from '../../api';
import { isAdmin } from '../../utils/user';

export function ThreadActions({ thread, user, onCopyLink, onRepost, onEdit, onDelete, setToast }) {
  const [isLiked, setIsLiked] = useState(thread?.liked ?? false);
  const [likesCount, setLikesCount] = useState(thread?.likes_count ?? 0);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    setIsLiked(thread?.liked ?? false);
    setLikesCount(thread?.likes_count ?? 0);
  }, [thread?.id, thread?.liked, thread?.likes_count]);

  useEffect(() => {
    const h = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) setIsShareMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLike = async () => {
    if (!user) { setToast?.({ message: 'Войдите для лайка', type: 'error' }); return; }
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevCount + (prevLiked ? -1 : 1));
    try {
      const { likes, liked } = await api.likePost(thread.id);
      setLikesCount(likes);
      setIsLiked(liked);
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      setToast?.({ message: 'Ошибка лайка', type: 'error' });
    }
  };

  const handleCopyLink = () => {
    onCopyLink?.();
    setIsShareMenuOpen(false);
  };

  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostComment, setRepostComment] = useState('');

  const handleRepostClick = () => {
    setRepostModalOpen(true);
    setRepostComment('');
  };

  const handleRepostSubmit = async () => {
    await onRepost?.(repostComment);
    setRepostModalOpen(false);
    setIsShareMenuOpen(false);
  };

  const canEdit = user && (thread?.author_id === user.id || isAdmin(user));

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={!user}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${isLiked ? 'text-red-500' : 'text-[#8b949e] hover:text-red-400'} hover:bg-white/5`}
        >
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
          <span>{likesCount}</span>
        </button>
        <div className="relative" ref={shareRef}>
          <button
            type="button"
            onClick={() => setIsShareMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#8b949e] hover:text-white hover:bg-white/10 transition-all"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Поделиться</span>
          </button>
        {isShareMenuOpen && (
          <div className="absolute left-0 bottom-full mb-2 z-[100] min-w-[200px] bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden">
            <button type="button" onClick={handleCopyLink} className="w-full text-left px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/5 flex items-center gap-2 transition-colors">
              <Link size={14} /> Скопировать ссылку
            </button>
            <button type="button" onClick={handleRepostClick} disabled={!user} className="w-full text-left px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/5 flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Repeat2 size={14} /> Репостнуть на стену
            </button>
          </div>
        )}
        </div>
      </div>
      {repostModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRepostModalOpen(false)}>
          <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-5 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-white mb-3">Добавить комментарий?</p>
            <textarea value={repostComment} onChange={(e) => setRepostComment(e.target.value)} placeholder="Ваш комментарий к репосту (необязательно)..." className="w-full min-h-[80px] py-2 px-3 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] resize-none mb-4" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRepostModalOpen(false)} className="px-4 py-2 text-[#8b949e] hover:text-white rounded-lg text-sm font-medium">Отмена</button>
              <button type="button" onClick={handleRepostSubmit} className="px-4 py-2 bg-[var(--color-accent)] text-black rounded-lg text-sm font-bold hover:opacity-90">Опубликовать</button>
            </div>
          </div>
        </div>
      )}
      {canEdit && (onEdit || onDelete) && (
        <div className="flex items-center gap-2">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Редактировать">
              <Pencil size={18} />
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors" title="Удалить">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
