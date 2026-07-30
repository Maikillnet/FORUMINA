import { FileText } from 'lucide-react';
import { UserLink } from '../components/ui/UserLink';
import { getAvatarUrl } from '../utils/user';

export function ArticlesPage({ articles, loading, onOpenArticle, onAuthorClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden animate-pulse">
            <div className="h-40 bg-[#30363d]" />
            <div className="p-5 space-y-2">
              <div className="h-4 bg-[#30363d] rounded w-3/4" />
              <div className="h-3 bg-[#30363d] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles?.length) {
    return (
      <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-12 text-center">
        <FileText size={48} className="mx-auto text-[#484f58] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Пока нет статей</h2>
        <p className="text-sm text-[#8b949e]">Станьте первым — опубликуйте гайд или разбор через «Создать тему», выбрав раздел «Статьи».</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => onOpenArticle(article)}
          className="group bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden cursor-pointer hover:border-[var(--color-accent)]/40 transition-colors flex flex-col"
        >
          <div className="h-40 relative overflow-hidden bg-gradient-to-br from-purple-600/30 to-indigo-600/30">
            {article.cover_image ? (
              <img src={article.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText size={40} className="text-white/30" />
              </div>
            )}
          </div>
          <div className="p-5 flex-1 flex flex-col gap-3">
            <h3 className="font-bold text-white text-lg leading-tight break-all line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-[#8b949e] line-clamp-2 break-all">
              {(article.content || '').replace(/[#*`]/g, '').slice(0, 140)}
            </p>
            <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500 pt-2">
              {article.author_id ? (
                <UserLink
                  userId={article.author_id}
                  username={article.author}
                  avatarUrl={article.author_avatar || getAvatarUrl({ username: article.author })}
                  rank={article.rank}
                  rankColor={article.rank_color}
                  size="xs"
                  onClick={onAuthorClick}
                />
              ) : (
                <span>{article.author}</span>
              )}
              <span>{article.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
