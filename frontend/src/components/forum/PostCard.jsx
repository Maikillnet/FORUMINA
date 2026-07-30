import { MessageSquare, Eye, Flame } from 'lucide-react';
import { UserLink, UserBanner } from '../ui/UserLink';
import { getAvatarUrl } from '../../utils/user';

export function PostCard({ post, onClick, onAuthorClick, categoryColor, onViewImage }) {
  const color = categoryColor || '#10b981';
  const hasCover = post.cover_image;
  return (
    <div onClick={() => onClick(post)} className={`group flex items-center gap-4 hover:bg-[#1c2128] transition-colors cursor-pointer overflow-hidden ${hasCover ? 'min-h-[100px]' : ''}`}>
      <div className="flex-1 min-w-0 p-5 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-white/10 bg-white/5 shrink-0" style={{ color, borderColor: `${color}40` }}>{post.category}</span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              {post.is_hot_trending ? <Flame size={16} className="text-orange-500 animate-pulse shrink-0 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" title="Горячая тема" /> : null}
              <h4 className="font-bold text-white text-lg leading-tight break-all line-clamp-2 overflow-hidden min-w-0 group-hover:text-[var(--color-accent)] transition-colors">
                {post.title}
              </h4>
            </div>
          </div>
          {post.is_pinned ? <span className="text-[9px] text-amber-400 shrink-0">Закреплено</span> : null}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {onAuthorClick && post.author_id ? (
            <UserLink userId={post.author_id} username={post.author} avatarUrl={post.author_avatar || getAvatarUrl({ username: post.author })} rank={post.rank} rankColor={post.rank_color} size="sm" onClick={onAuthorClick} />
          ) : (
            <>
              <span className={`font-semibold text-slate-200 ${post.rank_color || 'text-slate-400'}`}>{post.author}</span>
              <UserBanner rank={post.rank || 'User'} color={post.rank_color || 'text-slate-400'} />
            </>
          )}
          <span className="text-slate-600">•</span>
          <span>{post.time}</span>
          <span className="flex items-center gap-1 ml-auto text-slate-500"><MessageSquare size={12} /> {post.replies ?? 0}</span>
          <span className="flex items-center gap-1 text-slate-500"><Eye size={12} /> {post.views ?? 0}</span>
        </div>
      </div>
      {hasCover && (
        <div className="w-24 sm:w-28 h-28 flex-shrink-0 relative overflow-hidden rounded-xl" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--bg-block)] to-transparent z-10 pointer-events-none" />
          <img src={post.cover_image} alt="" className="w-full h-full object-cover object-center cursor-zoom-in" onClick={(e) => { e.stopPropagation(); onViewImage?.([post.cover_image], 0); }} />
        </div>
      )}
    </div>
  );
}
