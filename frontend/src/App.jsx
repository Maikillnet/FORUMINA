import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, MessageSquare, User, Code, Terminal, Briefcase, Shield,
  ChevronRight, MessageCircle, TrendingUp, MessageSquarePlus, Zap, Lock,
  FileText, ExternalLink, Award, Crown, X, ArrowUp, ArrowDown, ChevronLeft,
  Send, Eye, Activity, Trophy, Pencil, ImagePlus, Image, List, Smile,
  Heart, ThumbsUp, Gift, Users, ChevronDown, Plus, Trash2, UserPlus, UserMinus, Settings, Camera, Share2, Link, Repeat2, Paperclip, Folder, Palette
} from 'lucide-react';

const LUCIDE_ICONS = { Code, Shield, Terminal, Briefcase, MessageSquare, MessageCircle, Folder, FileText, Zap, Lock, List, Activity, Award };
const getIconComponent = (iconName) => LUCIDE_ICONS[iconName] || MessageSquare;
import * as api from './api';

const theme = {
  bg: 'bg-[var(--bg-main)]',
  card: 'bg-[var(--bg-block)]',
  cardHover: 'hover:bg-[#1c2128]',
  border: 'border-[#30363d]',
  accent: 'text-[var(--color-accent)]',
  accentBg: 'bg-[var(--color-accent)]',
  textMain: 'text-[var(--text-primary)]',
  textDim: 'text-[#8b949e]',
  textHeader: 'text-[var(--text-primary)]'
};

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Все темы', icon: 'MessageSquare', color: '#10b981' },
  { id: 'dev', name: 'Разработка', icon: 'Code', color: '#10b981' },
  { id: 'sec', name: 'Безопасность', icon: 'Shield', color: '#10b981' },
  { id: 'sys', name: 'Администрирование', icon: 'Terminal', color: '#10b981' },
  { id: 'career', name: 'Карьера', icon: 'Briefcase', color: '#10b981' },
];

const TOP_NAV = [
  { id: 'forum', name: 'Форум' },
  { id: 'articles', name: 'Статьи' },
  { id: 'rules', name: 'Правила' },
  { id: 'premium', name: 'Premium', color: 'text-[var(--color-accent)]' },
];

const DIRECT_POST_CATEGORIES = ['Backend', 'Frontend', 'DevOps', 'Languages', 'Security', 'Career'];

const RANKS = [
  { id: 'Юзер', color: 'text-slate-400' },
  { id: 'Боец', color: 'text-blue-400' },
  { id: 'Хранитель', color: 'text-cyan-400' },
  { id: 'Модератор', color: 'text-purple-400' },
  { id: 'Поверенный', color: 'text-amber-400' },
  { id: 'Легенда', color: 'text-orange-400' },
];
const getRankColor = (rank) => RANKS.find(r => r.id === rank)?.color || 'text-slate-400';

const RANK_GLOW = {
  'Юзер': { hex: '#94a3b8', rgba: 'rgba(148,163,184,0.5)' },
  'Боец': { hex: '#60a5fa', rgba: 'rgba(96,165,250,0.6)' },
  'Хранитель': { hex: '#22d3ee', rgba: 'rgba(34,211,238,0.6)' },
  'Модератор': { hex: '#a78bfa', rgba: 'rgba(167,139,250,0.6)' },
  'Поверенный': { hex: '#fbbf24', rgba: 'rgba(251,191,36,0.6)' },
  'Легенда': { hex: '#f97316', rgba: 'rgba(249,115,22,0.6)' },
  'default': { hex: 'var(--color-accent)', rgba: 'rgba(168,85,247,0.5)' },
};
const getAvatarGlowStyles = (rank) => {
  const r = displayRank(rank);
  const glow = RANK_GLOW[r] || RANK_GLOW.default;
  return { borderColor: glow.hex, boxShadow: `0 0 30px ${glow.rgba}` };
};

const getAvatarUrl = (u) => u?.custom_avatar || u?.avatar || null;
const isPlaceholderUrl = (url) => !url || typeof url !== 'string' || url.includes('unsplash') || url.includes('dicebear') || url.includes('placeholder') || url.includes('yandex');
const getWallAvatarUrl = (u) => (u?.custom_avatar || u?.avatar) && !isPlaceholderUrl(u?.custom_avatar || u?.avatar) ? (u.custom_avatar || u.avatar) : null;

const FIVE_MINUTES = 5 * 60 * 1000;
// Status MUST use ONLY user.last_online. Never use chat.updatedAt, lastMessage timestamp, or new Date() fallback.
const isOnline = (user) => {
  if (!user || !user.last_online) return false;
  const lastSeen = new Date(user.last_online).getTime();
  if (Number.isNaN(lastSeen)) return false;
  const diff = Date.now() - lastSeen;
  return diff < FIVE_MINUTES;
};
const getUserStatus = (u) => {
  if (isOnline(u)) return { isOnline: true, label: 'В сети' };
  if (!u?.last_online) return { isOnline: false, label: 'Офлайн' };
  return { isOnline: false, label: `Был(а) в сети ${formatTimeAgo(u.last_online)}` };
};
const getChatUserStatus = getUserStatus;
const formatTimeAgo = (timestamp) => {
  const sec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (sec < 60) return 'только что';
  if (sec < 3600) return `${Math.floor(sec / 60)} мин назад`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ч назад`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} дн назад`;
  if (sec < 2592000) return `${Math.floor(sec / 604800)} нед назад`;
  return `${Math.floor(sec / 2592000)} мес назад`;
};

const AvatarWithFallback = ({ src, alt, fallbackLetter, className = '' }) => {
  const [errored, setErrored] = useState(false);
  const displaySrc = errored || !src ? null : src;
  const letter = (fallbackLetter || alt || '?').charAt(0).toUpperCase();
  return displaySrc ? (
    <img src={displaySrc} alt={alt || ''} className={className} onError={() => setErrored(true)} />
  ) : (
    <div className={`${className} bg-slate-600 flex items-center justify-center text-white font-bold`} style={{ fontSize: '0.65em' }}>{letter}</div>
  );
};

const UserLink = ({ userId, username, avatarUrl, rank, rankColor, size = 'md', onClick }) => {
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

const UserBanner = ({ rank, color }) => {
  const c = color || getRankColor(rank);
  return (
    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-sm bg-opacity-10 border border-current ${c} flex items-center gap-1`}>
      {(rank === 'Легенда' || rank === 'Legend') && <Crown size={8} />}
      {rank}
    </span>
  );
};

const displayRank = (r) => (r === 'User' ? 'Юзер' : r === 'Legend' ? 'Легенда' : r || 'Юзер');

function ProfileBanner({ coverUrl, isOwnProfile, onCoverChange }) {
  const fileInputRef = useRef(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onCoverChange) return;
    if (file.size > 10 * 1024 * 1024) return;
    if (!file.type.startsWith('image/')) return;
    setCoverLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await onCoverChange(reader.result);
      } finally {
        setCoverLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="relative w-full h-[250px] rounded-t-2xl overflow-hidden group">
      {coverUrl ? (
        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" aria-hidden />
      {isOwnProfile && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={coverLoading}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-md text-white/90 hover:bg-black/50 hover:text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-medium disabled:opacity-50"
          >
            <Camera size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{coverLoading ? 'Загрузка...' : 'Обложка'}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </>
      )}
    </div>
  );
}

function TrophyCarousel({ trophies, emptyMessage = 'Нет трофеев', bgGradientFrom = '#222' }) {
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

function ThreadActions({ thread, user, onCopyLink, onRepost, setToast }) {
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

  const handleRepost = async () => {
    await onRepost?.();
    setIsShareMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
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
          <div className="absolute left-0 top-full mt-1 z-[100] min-w-[200px] bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden">
            <button type="button" onClick={handleCopyLink} className="w-full text-left px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/5 flex items-center gap-2 transition-colors">
              <Link size={14} /> Скопировать ссылку
            </button>
            <button type="button" onClick={handleRepost} disabled={!user} className="w-full text-left px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/5 flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Repeat2 size={14} /> Репостнуть на стену
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RankBadge({ userId, currentRank, currentColor, isAdmin, onRankChange, loading, glow = false }) {
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

function SimpleMarkdown({ children }) {
  const text = String(children || '');
  if (!text.trim()) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  const renderText = (t) =>
    t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  return (
    <div className="prose-emerald">
      {parts.map((p, i) =>
        p.startsWith('```') ? (
          <pre key={i} className="bg-[var(--bg-main)] p-4 rounded-lg border border-[#30363d] overflow-x-auto my-4">
            <code className="text-[var(--color-accent)] text-sm">{p.replace(/^```\w*\n?|```$/g, '').trim()}</code>
          </pre>
        ) : (
          <div key={i} dangerouslySetInnerHTML={{ __html: renderText(p) }} className="[&_strong]:text-[var(--color-accent)] [&_strong]:font-bold [&_code]:bg-[var(--bg-main)] [&_code]:text-[var(--color-accent)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:border [&_code]:border-[#30363d]" />
        )
      )}
    </div>
  );
}

function PlusIcon({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PostSkeleton() {
  return (
    <div className="p-4 flex items-center gap-4 animate-pulse">
      <div className="w-8 flex flex-col gap-2">
        <div className="h-5 bg-[#30363d] rounded" />
        <div className="h-4 bg-[#30363d] rounded w-6 mx-auto" />
        <div className="h-5 bg-[#30363d] rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#30363d] rounded w-3/4" />
        <div className="h-3 bg-[#30363d] rounded w-1/2" />
      </div>
    </div>
  );
}

function PostCard({ post, votes, onVote, onClick, onAuthorClick, categoryColor }) {
  const color = categoryColor || '#10b981';
  return (
    <div onClick={() => onClick(post)} className="group p-5 flex items-center gap-4 hover:bg-[#1c2128] transition-colors cursor-pointer">
      <div className="flex flex-col items-center gap-1 flex-shrink-0 w-8">
        <button onClick={(e) => onVote(post, 'up', e)} className={`p-1 rounded hover:bg-[#30363d] transition-colors ${votes[post.id] === 1 ? 'text-[var(--color-accent)]' : 'text-[#484f58]'}`}>
          <ArrowUp size={20} />
        </button>
        <span className="text-xs font-bold text-[#f0f6fc]">{post.votes ?? 0}</span>
        <button onClick={(e) => onVote(post, 'down', e)} className={`p-1 rounded hover:bg-[#30363d] transition-colors ${votes[post.id] === -1 ? 'text-red-500' : 'text-[#484f58]'}`}>
          <ArrowDown size={20} />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded border" style={{ color, backgroundColor: `${color}15`, borderColor: `${color}30` }}>{post.category}</span>
          <h3 className="text-sm md:text-base font-bold text-[#f0f6fc] group-hover:text-[var(--color-accent)] transition-colors break-all">{post.title}</h3>
          {post.is_pinned && <span className="text-[9px] text-amber-400">Закреплено</span>}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8b949e]">
          {onAuthorClick && post.author_id ? (
            <UserLink userId={post.author_id} username={post.author} avatarUrl={post.author_avatar || getAvatarUrl({ username: post.author })} rank={post.rank} rankColor={post.rank_color} size="sm" onClick={onAuthorClick} />
          ) : (
            <>
              <span className={`font-bold ${post.rank_color || 'text-slate-400'}`}>{post.author}</span>
              <UserBanner rank={post.rank || 'User'} color={post.rank_color || 'text-slate-400'} />
            </>
          )}
          <span>•</span>
          <span>{post.time}</span>
          <span className="flex items-center gap-1 ml-auto"><MessageSquare size={12} /> {post.replies ?? 0}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

function MessagesPage({ user, activeChatUser, conversations, chatHistory, loading, onSelectContact, onSend, getAvatarUrl }) {
  const [input, setInput] = useState('');
  const historyRef = useRef(null);
  useEffect(() => { historyRef.current?.scrollTo(0, historyRef.current.scrollHeight); }, [chatHistory]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeChatUser) return;
    onSend(input.trim());
    setInput('');
  };
  const isActive = (c) => activeChatUser?.id === (c?.contactId ?? c?.id);
  const status = getChatUserStatus(activeChatUser);
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar - Glass panel */}
        <div className="w-[30%] min-w-[220px] border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col">
          <div className="px-4 py-4 border-b border-white/5">
            <h2 className="text-[11px] font-black text-white/90 uppercase tracking-[0.2em]">Мои чаты</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!user ? (
              <div className="p-6 text-center text-white/60 text-sm">Войдите для просмотра сообщений</div>
            ) : loading && conversations.length === 0 ? (
              <div className="p-6 text-white/60 text-sm">Загрузка...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-white/60 text-sm">Нет диалогов. Нажмите «Написать сообщение» в профиле пользователя.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {conversations.map((c) => {
                  const isUserOnline = isOnline(c);
                  return (
                <button
                  key={c.contactId}
                  type="button"
                  onClick={() => onSelectContact(c)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${isActive(c) ? 'bg-white/[0.04] border border-white/5 shadow-sm' : 'bg-transparent border border-transparent hover:bg-white/[0.04] hover:border-white/5'}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
                      <AvatarWithFallback src={c.avatar} alt={c.username} fallbackLetter={c.username} className="w-full h-full object-cover" />
                    </div>
                    <span className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-[#0f0f13] ${isUserOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{c.username}</div>
                    <div className="text-[11px] text-white/50 truncate">{c.lastMessage || 'Нет сообщений'}</div>
                  </div>
                </button>
              ); })}
              </div>
            )}
          </div>
        </div>
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Subtle gradient glow background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          {activeChatUser ? (
            <>
              {/* Glass header */}
              <div className="h-16 border-b border-white/5 flex items-center px-6 backdrop-blur-md bg-black/20 sticky top-0 z-10 flex-shrink-0">
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-black/40 shadow-lg shadow-purple-500/10">
                    <AvatarWithFallback src={getAvatarUrl(activeChatUser)} alt={activeChatUser.username} fallbackLetter={activeChatUser.username} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-white truncate block">{activeChatUser.username}</span>
                    <span className={`text-[10px] flex items-center gap-1 ${status.isOnline ? 'text-emerald-400/90' : 'text-orange-400/90'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
              {/* Messages area with depth */}
              <div ref={historyRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                {loading && chatHistory.length === 0 ? (
                  <div className="text-white/60 text-sm">Загрузка...</div>
                ) : !loading && chatHistory.length === 0 ? (
                  <div className="text-white/60 text-sm">Нет сообщений. Напишите первым!</div>
                ) : (
                  chatHistory.map((m) => (
                    <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 text-sm rounded-2xl shadow-lg ${m.isMine ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm shadow-purple-500/20' : 'bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-tl-sm'}`}>
                        <p className="break-words whitespace-pre-wrap">{m.content}</p>
                        <span className={`text-[10px] mt-1 block ${m.isMine ? 'text-white/80' : 'text-white/50'}`}>{m.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Floating glass input */}
              {user ? (
                <form onSubmit={handleSubmit} className="m-4 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-2 flex-shrink-0">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
                    placeholder="Сообщение..."
                  />
                  <button type="submit" className="p-3 bg-[var(--color-accent)] text-black rounded-xl shadow-lg hover:shadow-[var(--color-accent)]/50 transition-all duration-300 hover:scale-105">
                    <Send size={18} />
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 relative">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-white/30 mb-4" />
                <p className="text-white/50 text-sm">Выберите чат, чтобы начать переписку</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminMessages({ setToast }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadPosts = useCallback(() => {
    setLoading(true);
    api.getAdminPosts(page, perPage)
      .then(({ items: list, total: t }) => {
        setItems(list || []);
        setTotal(t || 0);
      })
      .catch(() => setToast({ message: 'Ошибка загрузки постов', type: 'error' }))
      .finally(() => setLoading(false));
  }, [page, perPage, setToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.deleteAdminPost(id);
      setToast({ message: 'Пост удалён', type: 'success' });
      loadPosts();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка удаления', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / perPage) || 1;

  return (
    <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#30363d]">
        <h3 className="text-lg font-black text-white">Сообщения (посты)</h3>
        <p className="text-[11px] text-[#8b949e] mt-1">Просмотр и модерация всех тем форума</p>
      </div>
      {loading ? (
        <div className="p-8 text-center text-[#8b949e] text-sm">Загрузка...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Автор</th>
                  <th className="p-4 font-bold">Тема</th>
                  <th className="p-4 font-bold">Превью</th>
                  <th className="p-4 font-bold">Дата</th>
                  <th className="p-4 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                    <td className="p-4 font-mono text-[#8b949e]">{p.id}</td>
                    <td className="p-4 font-medium text-white">{p.author || '—'}</td>
                    <td className="p-4 text-white max-w-[200px] truncate">{p.title || '—'}</td>
                    <td className="p-4 text-[#8b949e] max-w-[240px] truncate">{p.content_preview || (p.content || '').substring(0, 80) + '…'}</td>
                    <td className="p-4 text-[#8b949e]">{p.time || '—'}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <div className="p-8 text-center text-[#8b949e] text-sm">Нет постов</div>
          )}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
              <span className="text-[#8b949e] text-sm">Всего: {total}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 bg-[var(--bg-main)] border border-[#30363d] rounded text-sm text-white disabled:opacity-50 hover:border-[var(--color-accent)]/50"
                >
                  ← Назад
                </button>
                <span className="px-3 py-1.5 text-[#8b949e] text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 bg-[var(--bg-main)] border border-[#30363d] rounded text-sm text-white disabled:opacity-50 hover:border-[var(--color-accent)]/50"
                >
                  Вперёд →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminPanel({ adminTab, setAdminTab, adminTrophies, setAdminTrophies, adminUsers, grantTrophyTarget, setGrantTrophyTarget, setToast, setView, getAvatarUrl, categories, loadCategories, refreshSiteSettings, onPreviewPattern }) {
  const [trophyName, setTrophyName] = useState('');
  const [trophyDesc, setTrophyDesc] = useState('');
  const [trophyImage, setTrophyImage] = useState(null);
  const [trophyLoading, setTrophyLoading] = useState(false);
  const [selectedTrophyId, setSelectedTrophyId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [reputationPerThread, setReputationPerThread] = useState(5);
  const [siteName, setSiteName] = useState('FORUM.LIVE');
  const [siteLogo, setSiteLogo] = useState('');
  const [siteLogoPreview, setSiteLogoPreview] = useState(null);
  const [sitePattern, setSitePattern] = useState('');
  const [sitePatternPreview, setSitePatternPreview] = useState(null);
  const [bonusUsers, setBonusUsers] = useState(0);
  const [bonusMessages, setBonusMessages] = useState(0);
  const [realStats, setRealStats] = useState({ real_users: 0, real_messages: 0 });
  const [themeSettings, setThemeSettings] = useState({ bg_main: '#0d1117', bg_block: '#161b22', text_primary: '#ffffff', color_accent: '#10b981', bg_widget: '#13131f', widget_opacity: 0.7, block_opacity: 0.8, bg_profile: '#1a0b2e', profile_opacity: 0.8 });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaveLoading, setSettingsSaveLoading] = useState(false);
  const [recalculateLoading, setRecalculateLoading] = useState(false);
  const fileInputRef = useRef(null);
  const siteLogoInputRef = useRef(null);
  const sitePatternInputRef = useRef(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: 'Folder', color: '#10b981' });
  const [categorySaveLoading, setCategorySaveLoading] = useState(false);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState(null);

  useEffect(() => {
    if (adminTab === 'categories') loadCategories?.();
  }, [adminTab, loadCategories]);

  useEffect(() => {
    if (adminTab === 'settings') {
      const hexToRgba = (hex, alpha) => {
        const h = (hex || '#13131f').replace('#', '');
        const r = parseInt(h.slice(0, 2), 16) || 19;
        const g = parseInt(h.slice(2, 4), 16) || 19;
        const b = parseInt(h.slice(4, 6), 16) || 31;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      const widgetHex = toValidHex(themeSettings.bg_widget, '#13131f');
      const widgetOpacity = themeSettings.widget_opacity ?? 0.7;
      document.documentElement.style.setProperty('--bg-widget-glass', hexToRgba(widgetHex, widgetOpacity));
      const blockHex = toValidHex(themeSettings.bg_block, '#161b22');
      const blockOpacity = themeSettings.block_opacity ?? 0.8;
      document.documentElement.style.setProperty('--bg-block-glass', hexToRgba(blockHex, blockOpacity));
      const profileHex = toValidHex(themeSettings.bg_profile, '#1a0b2e');
      const profileOpacity = themeSettings.profile_opacity ?? 0.8;
      document.documentElement.style.setProperty('--bg-profile-glass', hexToRgba(profileHex, profileOpacity));
    }
  }, [adminTab, themeSettings.bg_widget, themeSettings.widget_opacity, themeSettings.bg_block, themeSettings.block_opacity, themeSettings.bg_profile, themeSettings.profile_opacity]);

  useEffect(() => {
    if (adminTab === 'settings') {
      setSettingsLoading(true);
      api.getAdminSettings()
        .then((list) => {
          const rep = list.find((x) => x.key === 'reputation_per_thread');
          setReputationPerThread(rep ? parseInt(rep.value, 10) || 5 : 5);
          const name = list.find((x) => x.key === 'site_name');
          setSiteName(name?.value || 'FORUM.LIVE');
          const logo = list.find((x) => x.key === 'site_logo');
          const logoVal = logo?.value || '';
          setSiteLogo(logoVal);
          setSiteLogoPreview(logoVal || null);
          const pattern = list.find((x) => x.key === 'site_pattern');
          const patternVal = pattern?.value || '';
          setSitePattern(patternVal);
          setSitePatternPreview(patternVal || null);
          const bonusU = list.find((x) => x.key === 'bonus_users');
          setBonusUsers(bonusU ? parseInt(bonusU.value, 10) || 0 : 0);
          const bonusM = list.find((x) => x.key === 'bonus_messages');
          setBonusMessages(bonusM ? parseInt(bonusM.value, 10) || 0 : 0);
          const themeRaw = list.find((x) => x.key === 'theme')?.value;
          if (themeRaw) {
            try {
              const t = JSON.parse(themeRaw);
              setThemeSettings({ bg_main: t.bg_main || '#0d1117', bg_block: t.bg_block || '#161b22', text_primary: t.text_primary || '#ffffff', color_accent: t.color_accent || '#10b981', bg_widget: t.bg_widget || '#13131f', widget_opacity: typeof t.widget_opacity === 'number' ? t.widget_opacity : 0.7, block_opacity: typeof t.block_opacity === 'number' ? t.block_opacity : 0.8, bg_profile: t.bg_profile || '#1a0b2e', profile_opacity: typeof t.profile_opacity === 'number' ? t.profile_opacity : 0.8 });
            } catch { }
          }
        })
        .catch(() => setToast({ message: 'Ошибка загрузки настроек', type: 'error' }))
        .finally(() => setSettingsLoading(false));
      api.getStats().then((s) => setRealStats({ real_users: s.real_users ?? s.users ?? 0, real_messages: s.real_messages ?? 0 }));
    }
  }, [adminTab, setToast]);

  const toValidHex = (v, fallback) => {
    const s = (v || '').trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s;
    if (/^[0-9a-fA-F]{3}$/.test(s)) return '#' + s.split('').map(c => c + c).join('');
    return fallback;
  };

  const handleThemeHexChange = (key, raw) => {
    const v = raw && !raw.startsWith('#') ? '#' + raw : (raw || '');
    setThemeSettings(t => ({ ...t, [key]: v }));
  };

  const MAX_BRANDING_SIZE = 40 * 1024 * 1024; // 40MB
  const handleSiteLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BRANDING_SIZE) { setToast({ message: 'Файл слишком велик! Лимит до 40 МБ.', type: 'error' }); return; }
    if (!file.type.startsWith('image/')) { setToast({ message: 'Только изображения', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      setSiteLogo(data);
      setSiteLogoPreview(data);
    };
    reader.readAsDataURL(file);
  };

  const handleSitePatternChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BRANDING_SIZE) { setToast({ message: 'Файл слишком велик! Лимит до 40 МБ.', type: 'error' }); return; }
    if (!file.type.startsWith('image/')) { setToast({ message: 'Только изображения (PNG, JPG)', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      setSitePattern(data);
      setSitePatternPreview(data);
      onPreviewPattern?.(data);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePattern = () => {
    setSitePattern('');
    setSitePatternPreview(null);
    onPreviewPattern?.('');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const val = parseInt(reputationPerThread, 10);
    if (isNaN(val) || val < 0) {
      setToast({ message: 'Введите неотрицательное число', type: 'error' });
      return;
    }
    setSettingsSaveLoading(true);
    try {
      const themeToSave = {
        bg_main: toValidHex(themeSettings.bg_main, '#0d1117'),
        bg_block: toValidHex(themeSettings.bg_block, '#161b22'),
        text_primary: toValidHex(themeSettings.text_primary, '#ffffff'),
        color_accent: toValidHex(themeSettings.color_accent, '#10b981'),
        bg_widget: toValidHex(themeSettings.bg_widget, '#13131f'),
        widget_opacity: Math.max(0, Math.min(1, Number(themeSettings.widget_opacity) || 0.7)),
        block_opacity: Math.max(0, Math.min(1, Number(themeSettings.block_opacity) || 0.8)),
        bg_profile: toValidHex(themeSettings.bg_profile, '#1a0b2e'),
        profile_opacity: Math.max(0, Math.min(1, Number(themeSettings.profile_opacity) || 0.8)),
      };
      await api.updateAdminSettings({
        site_name: siteName.trim() || 'FORUM.LIVE',
        site_logo: siteLogo,
        site_pattern: sitePattern,
        bonus_users: bonusUsers,
        bonus_messages: bonusMessages,
        reputation_per_thread: val,
        theme: themeToSave,
      });
      refreshSiteSettings?.();
      setToast({ message: 'Настройки сохранены', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка сохранения', type: 'error' });
    } finally {
      setSettingsSaveLoading(false);
    }
  };

  const handleRecalculateReputation = async () => {
    setRecalculateLoading(true);
    try {
      const res = await api.recalculateReputation();
      setToast({ message: 'Репутация пересчитана!', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка пересчёта', type: 'error' });
    } finally {
      setRecalculateLoading(false);
    }
  };

  const handleTrophyFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setToast({ message: 'Файл до 2 МБ', type: 'error' }); return; }
    if (!file.type.startsWith('image/')) { setToast({ message: 'Только изображения', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = () => setTrophyImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreateTrophy = async (e) => {
    e.preventDefault();
    if (!trophyName.trim()) return;
    setTrophyLoading(true);
    try {
      const t = await api.createTrophy(trophyName.trim(), trophyDesc.trim(), trophyImage);
      setAdminTrophies((prev) => [t, ...prev]);
      setTrophyName('');
      setTrophyDesc('');
      setTrophyImage(null);
      setToast({ message: 'Трофей создан', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    } finally {
      setTrophyLoading(false);
    }
  };

  const handleDeleteTrophy = async (id) => {
    try {
      await api.deleteTrophy(id);
      setAdminTrophies((prev) => prev.filter((t) => t.id !== id));
      setToast({ message: 'Трофей удалён', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleAssignTrophy = async () => {
    if (!grantTrophyTarget || !selectedTrophyId) return;
    setAssignLoading(true);
    try {
      await api.assignTrophyToUser(grantTrophyTarget.id, selectedTrophyId);
      setToast({ message: 'Трофей выдан', type: 'success' });
      setGrantTrophyTarget(null);
      setSelectedTrophyId(null);
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[11px] text-[#484f58] font-bold uppercase tracking-wider">
        <button onClick={() => setView('feed')} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
        <ChevronRight size={12} />
        <span className="text-amber-500">Админ-панель</span>
      </div>
      <div className="flex gap-2 pb-4 border-b border-[#30363d]">
        <button onClick={() => setAdminTab('trophies')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === 'trophies' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>
          <Trophy size={14} className="inline mr-2" /> Трофеи
        </button>
        <button onClick={() => setAdminTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === 'settings' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>
          <Settings size={14} className="inline mr-2" /> Настройки
        </button>
        <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === 'users' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>
          <Users size={14} className="inline mr-2" /> Пользователи
        </button>
        <button onClick={() => setAdminTab('categories')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === 'categories' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>
          <List size={14} className="inline mr-2" /> Категории
        </button>
        <button onClick={() => setAdminTab('messages')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === 'messages' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>
          <MessageSquare size={14} className="inline mr-2" /> Сообщения
        </button>
      </div>

      {adminTab === 'trophies' && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus size={18} /> Добавить трофей</h3>
            <form onSubmit={handleCreateTrophy} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Название</label>
                <input value={trophyName} onChange={(e) => setTrophyName(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Например: 3 года на форуме" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Описание</label>
                <input value={trophyDesc} onChange={(e) => setTrophyDesc(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Краткое описание" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Изображение</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white hover:border-[var(--color-accent)]/50 transition-colors">
                    {trophyImage ? 'Изменить изображение' : 'Загрузить изображение'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleTrophyFileChange} className="hidden" />
                  {trophyImage && <img src={trophyImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-[#30363d]" />}
                </div>
              </div>
              <button type="submit" disabled={trophyLoading} className="px-6 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">Создать трофей</button>
            </form>
          </div>
          <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6">
            <h3 className="text-lg font-black text-white mb-4">Список трофеев</h3>
            {adminTrophies.length === 0 ? (
              <p className="text-[#8b949e] text-sm">Нет трофеев. Добавьте первый.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {adminTrophies.map((t) => (
                  <div key={t.id} className="p-4 bg-[var(--bg-main)] rounded-xl border border-[#30363d] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--bg-block)] border-2 border-[#30363d] flex items-center justify-center">
                      {t.image_url ? <img src={t.image_url} alt="" className="w-full h-full object-cover" /> : <Trophy size={24} className="text-amber-400" />}
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white text-sm truncate max-w-[120px]">{t.name}</div>
                      {t.description && <div className="text-[10px] text-[#8b949e] truncate max-w-[120px]">{t.description}</div>}
                    </div>
                    <button type="button" onClick={() => handleDeleteTrophy(t.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === 'settings' && (
        <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-black text-white mb-4">Настройки форума</h3>
          {settingsLoading ? (
            <p className="text-[#8b949e] text-sm">Загрузка...</p>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-md">
              <div className="pb-4 mb-4 border-b border-[#30363d]">
                <h4 className="text-sm font-black text-white mb-3">Общие настройки</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Название форума</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]"
                      placeholder="FORUM.LIVE"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Логотип форума</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => siteLogoInputRef.current?.click()} className="px-4 py-2 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white hover:border-[var(--color-accent)]/50 transition-colors">
                        {siteLogoPreview ? 'Изменить логотип' : 'Загрузить логотип'}
                      </button>
                      <input ref={siteLogoInputRef} type="file" accept="image/*" onChange={handleSiteLogoChange} className="hidden" />
                      {siteLogoPreview ? (
                        <img src={siteLogoPreview} alt="" className="w-12 h-12 rounded-lg object-cover border border-[#30363d]" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[var(--bg-main)] border border-[#30363d] flex items-center justify-center text-[#666] text-xs">Нет</div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8b949e] mt-1">Отображается в шапке сайта. До 40 МБ.</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Узор фона</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button type="button" onClick={() => sitePatternInputRef.current?.click()} className="px-4 py-2 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white hover:border-[var(--color-accent)]/50 transition-colors">
                        {sitePatternPreview ? 'Изменить узор' : 'Загрузить узор'}
                      </button>
                      <input ref={sitePatternInputRef} type="file" accept="image/*" onChange={handleSitePatternChange} className="hidden" />
                      {sitePatternPreview ? (
                        <>
                          <div className="w-16 h-16 rounded-lg border border-[#30363d] overflow-hidden bg-[var(--bg-main)]" style={{ backgroundImage: `url(${sitePatternPreview})`, backgroundRepeat: 'repeat', backgroundSize: '32px 32px' }} />
                          <button type="button" onClick={handleRemovePattern} className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">Удалить узор</button>
                        </>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-[var(--bg-main)] border border-[#30363d] flex items-center justify-center text-[#666] text-xs">Нет</div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8b949e] mt-1">Плиточный узор поверх фона (сетка, точки, текстура). PNG до 40 МБ.</p>
                  </div>
                </div>
              </div>
              <div className="pb-4 mb-4 border-b border-[#30363d]">
                <h4 className="text-sm font-black text-white mb-3">Настройка показателей</h4>
                <p className="text-[11px] text-[#8b949e] mb-3">Добавьте визуальный бонус к счётчикам. Реальные значения видны только вам.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Добавить пользователей (визуально)</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" value={bonusUsers} onChange={(e) => setBonusUsers(Math.max(0, parseInt(e.target.value, 10) || 0))} className="w-24 bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
                      <span className="text-[10px] text-[#666]">реально: {realStats.real_users}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Добавить сообщений (визуально)</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" value={bonusMessages} onChange={(e) => setBonusMessages(Math.max(0, parseInt(e.target.value, 10) || 0))} className="w-24 bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
                      <span className="text-[10px] text-[#666]">реально: {realStats.real_messages}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pb-4 mb-4 border-b border-[#30363d]">
                <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Palette size={16} /> Визуальная тема</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Фон сайта</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toValidHex(themeSettings.bg_main, '#0d1117')} onChange={(e) => setThemeSettings(t => ({ ...t, bg_main: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-[#30363d] bg-transparent" />
                      <input type="text" value={themeSettings.bg_main} onChange={(e) => handleThemeHexChange('bg_main', e.target.value)} className="w-28 bg-[var(--bg-main)] border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-accent)]" placeholder="#0d1117" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Фон блоков</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toValidHex(themeSettings.bg_block, '#161b22')} onChange={(e) => setThemeSettings(t => ({ ...t, bg_block: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-[#30363d] bg-transparent" />
                      <input type="text" value={themeSettings.bg_block} onChange={(e) => handleThemeHexChange('bg_block', e.target.value)} className="w-28 bg-[var(--bg-main)] border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-accent)]" placeholder="#161b22" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Прозрачность блоков</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="1" step="0.05" value={themeSettings.block_opacity ?? 0.8} onChange={(e) => setThemeSettings(t => ({ ...t, block_opacity: parseFloat(e.target.value) }))} className="flex-1 h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                      <span className="text-sm font-mono text-white min-w-[3rem]">{Math.round((themeSettings.block_opacity ?? 0.8) * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Цвет текста</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toValidHex(themeSettings.text_primary, '#ffffff')} onChange={(e) => setThemeSettings(t => ({ ...t, text_primary: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-[#30363d] bg-transparent" />
                      <input type="text" value={themeSettings.text_primary} onChange={(e) => handleThemeHexChange('text_primary', e.target.value)} className="w-28 bg-[var(--bg-main)] border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-accent)]" placeholder="#ffffff" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Акцентный цвет</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toValidHex(themeSettings.color_accent, '#10b981')} onChange={(e) => setThemeSettings(t => ({ ...t, color_accent: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-[#30363d] bg-transparent" />
                      <input type="text" value={themeSettings.color_accent} onChange={(e) => handleThemeHexChange('color_accent', e.target.value)} className="w-28 bg-[var(--bg-main)] border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-accent)]" placeholder="#10b981" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Фон виджетов</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toValidHex(themeSettings.bg_widget, '#13131f')} onChange={(e) => setThemeSettings(t => ({ ...t, bg_widget: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-[#30363d] bg-transparent" />
                      <input type="text" value={themeSettings.bg_widget} onChange={(e) => handleThemeHexChange('bg_widget', e.target.value)} className="w-28 bg-[var(--bg-main)] border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-accent)]" placeholder="#13131f" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Прозрачность виджетов</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="1" step="0.05" value={themeSettings.widget_opacity ?? 0.7} onChange={(e) => setThemeSettings(t => ({ ...t, widget_opacity: parseFloat(e.target.value) }))} className="flex-1 h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                      <span className="text-sm font-mono text-white min-w-[3rem]">{Math.round((themeSettings.widget_opacity ?? 0.7) * 100)}%</span>
                    </div>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#30363d]">
                    <h5 className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-wider mb-3">Фон Профиля</h5>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Цвет фона</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={toValidHex(themeSettings.bg_profile, '#1a0b2e')} onChange={(e) => setThemeSettings(t => ({ ...t, bg_profile: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-[#30363d] bg-transparent" />
                      <input type="text" value={themeSettings.bg_profile} onChange={(e) => handleThemeHexChange('bg_profile', e.target.value)} className="w-28 bg-[var(--bg-main)] border border-white/10 rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-accent)]" placeholder="#1a0b2e" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Прозрачность профиля</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="1" step="0.05" value={themeSettings.profile_opacity ?? 0.8} onChange={(e) => setThemeSettings(t => ({ ...t, profile_opacity: parseFloat(e.target.value) }))} className="flex-1 h-2 bg-[var(--bg-main)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                      <span className="text-sm font-mono text-white min-w-[3rem]">{Math.round((themeSettings.profile_opacity ?? 0.8) * 100)}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-2">Обновит цвета сайта после сохранения. Можно вводить hex с # или без.</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Репутация за создание темы</label>
                <input
                  type="number"
                  min="0"
                  value={reputationPerThread}
                  onChange={(e) => setReputationPerThread(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="5"
                />
                <p className="text-[11px] text-[#8b949e] mt-1">Количество очков репутации, начисляемых пользователю за создание новой темы</p>
              </div>
              <button type="submit" disabled={settingsSaveLoading} className="px-6 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">
                {settingsSaveLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <div className="pt-6 mt-6 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={handleRecalculateReputation}
                  disabled={recalculateLoading}
                  className="px-6 py-2 border-2 border-amber-500/60 text-amber-400 rounded-lg font-bold text-sm hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
                >
                  {recalculateLoading ? 'Пересчёт...' : 'Пересчитать репутацию всем пользователям'}
                </button>
                <p className="text-[11px] text-[#8b949e] mt-2">Обновит репутацию всех пользователей на основе тем, голосов и комментариев</p>
              </div>
            </form>
          )}
        </div>
      )}

      {adminTab === 'users' && (
        <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#30363d]">
            <h3 className="text-lg font-black text-white">Пользователи</h3>
          </div>
          <div className="divide-y divide-[#30363d] max-h-[500px] overflow-y-auto">
            {adminUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-[#1c2128]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-main)] border border-[#30363d]">
                    <AvatarWithFallback src={getAvatarUrl(u)} alt="" fallbackLetter={u.username} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{u.username}</div>
                    <div className="text-[10px] text-[#8b949e]">{u.rank || 'Юзер'}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setGrantTrophyTarget(u)} className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors">
                  <Trophy size={12} className="inline mr-1" /> Выдать трофей
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'messages' && <AdminMessages setToast={setToast} />}

      {adminTab === 'categories' && (
        <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Управление категориями</h3>
            <button onClick={() => { setCategoryModal({ mode: 'create' }); setCategoryForm({ name: '', description: '', icon: 'Folder', color: '#10b981' }); }} className="px-4 py-2 bg-[var(--color-accent)] text-black rounded-lg text-xs font-bold hover:bg-[color:var(--color-accent)]/90 flex items-center gap-2">
              <Plus size={14} /> Добавить
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                  <th className="p-4 font-bold">Название</th>
                  <th className="p-4 font-bold">Описание</th>
                  <th className="p-4 font-bold">Иконка</th>
                  <th className="p-4 font-bold">Цвет</th>
                  <th className="p-4 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {(categories || []).map((c) => {
                  const IconC = LUCIDE_ICONS[c.icon] || Folder;
                  return (
                    <tr key={c.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                      <td className="p-4 font-medium text-white">{c.name}</td>
                      <td className="p-4 text-[#8b949e] max-w-[200px] truncate">{c.description || '—'}</td>
                      <td className="p-4"><span style={{ color: c.color || '#10b981' }}><IconC size={18} /></span></td>
                      <td className="p-4"><span className="inline-flex items-center gap-2"><span className="w-6 h-6 rounded border border-[#30363d]" style={{ backgroundColor: c.color || '#10b981' }} /> {c.color || '#10b981'}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setCategoryModal({ mode: 'edit', category: c }); setCategoryForm({ name: c.name, description: c.description || '', icon: c.icon || 'Folder', color: c.color || '#10b981' }); }} className="p-1.5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded mr-1" title="Редактировать название"><Pencil size={14} /></button>
                        <button onClick={() => { setCategoryModal({ mode: 'style', category: c }); setCategoryForm({ name: c.name, description: c.description || '', icon: c.icon || 'Folder', color: c.color || '#10b981' }); }} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded mr-1" title="Изменить стиль"><Palette size={14} /></button>
                        {c.id !== 'messages' && c.id !== 'all' && (
                          <button onClick={() => setCategoryDeleteConfirm(c)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Удалить"><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(!categories || categories.length === 0) && (
            <div className="p-8 text-center text-[#8b949e] text-sm">Нет категорий. Добавьте первую.</div>
          )}
        </div>
      )}

      {categoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => { setCategoryModal(null); setCategoryForm({ name: '', description: '', icon: 'Folder', color: '#10b981' }); }} />
          <div className="relative bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">{categoryModal.mode === 'create' ? 'Новая категория' : categoryModal.mode === 'style' ? 'Изменить стиль' : 'Редактировать категорию'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setCategorySaveLoading(true);
              try {
                if (categoryModal.mode === 'create') {
                  await api.createCategory(categoryForm);
                  setToast({ message: 'Категория создана', type: 'success' });
                } else {
                  await api.updateCategory(categoryModal.category.id, categoryForm);
                  setToast({ message: 'Категория обновлена', type: 'success' });
                }
                loadCategories?.();
                setCategoryModal(null);
              } catch (err) {
                setToast({ message: err?.message || 'Ошибка', type: 'error' });
              } finally {
                setCategorySaveLoading(false);
              }
            }} className="space-y-4">
              {(categoryModal.mode === 'create' || categoryModal.mode === 'edit') && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Название</label>
                    <input value={categoryForm.name} onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Название категории" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Описание</label>
                    <input value={categoryForm.description} onChange={(e) => setCategoryForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Краткое описание" />
                  </div>
                </>
              )}
              {(categoryModal.mode === 'create' || categoryModal.mode === 'style') && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Иконка (Lucide)</label>
                    <select value={categoryForm.icon} onChange={(e) => setCategoryForm(f => ({ ...f, icon: e.target.value }))} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]">
                      {Object.keys(LUCIDE_ICONS).map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Цвет</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm(f => ({ ...f, color: e.target.value }))} className="w-12 h-10 rounded border border-[#30363d] cursor-pointer bg-transparent" />
                      <input value={categoryForm.color} onChange={(e) => setCategoryForm(f => ({ ...f, color: e.target.value }))} className="flex-1 bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)] font-mono text-sm" />
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setCategoryModal(null)} className="px-4 py-2 text-[#8b949e] hover:text-white transition-colors">Отмена</button>
                <button type="submit" disabled={categorySaveLoading} className="px-6 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">{categorySaveLoading ? 'Сохранение...' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setCategoryDeleteConfirm(null)} />
          <div className="relative bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Удалить категорию?</h3>
            <p className="text-[#8b949e] text-sm mb-4">Категория «{categoryDeleteConfirm.name}» будет удалена. Это действие нельзя отменить. Удаление невозможно, если в категории есть темы.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCategoryDeleteConfirm(null)} className="px-4 py-2 text-[#8b949e] hover:text-white transition-colors">Отмена</button>
              <button onClick={async () => {
                try {
                  await api.deleteCategory(categoryDeleteConfirm.id);
                  setToast({ message: 'Категория удалена', type: 'success' });
                  loadCategories?.();
                  setCategoryDeleteConfirm(null);
                } catch (err) {
                  setToast({ message: err?.message || 'Ошибка', type: 'error' });
                }
              }} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-400">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {grantTrophyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => { setGrantTrophyTarget(null); setSelectedTrophyId(null); }} />
          <div className="relative bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">Выдать трофей пользователю {grantTrophyTarget.username}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {adminTrophies.length === 0 ? <p className="text-[#8b949e] text-sm">Нет трофеев</p> : adminTrophies.map((t) => (
                <button key={t.id} type="button" onClick={() => setSelectedTrophyId(t.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${selectedTrophyId === t.id ? 'bg-amber-500/20 border-amber-500/50' : 'bg-[var(--bg-main)] border-[#30363d] hover:border-[#484f58]'}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-block)] flex items-center justify-center flex-shrink-0">
                    {t.image_url ? <img src={t.image_url} alt="" className="w-full h-full object-cover" /> : <Trophy size={18} className="text-amber-400" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">{t.name}</div>
                    {t.description && <div className="text-[10px] text-[#8b949e]">{t.description}</div>}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setGrantTrophyTarget(null); setSelectedTrophyId(null); }} className="flex-1 py-2 border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white">Отмена</button>
              <button type="button" onClick={handleAssignTrophy} disabled={!selectedTrophyId || assignLoading} className="flex-1 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">Выдать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileEditModal({ user, onClose, onSave }) {
  const [username, setUsername] = useState(user?.username || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [interests, setInterests] = useState(user?.interests || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.custom_avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError('Файл не более 20 МБ');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Только изображения (JPG, PNG, GIF)');
      return;
    }
    setError('');
    setAvatarFile(file);
    setAvatarRemoved(false);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {};
      const trimmed = username.trim();
      if (trimmed && trimmed !== user?.username) data.username = trimmed;
      if (gender !== (user?.gender || '')) data.gender = gender;
      if (occupation !== (user?.occupation || '')) data.occupation = occupation;
      if (interests !== (user?.interests || '')) data.interests = interests;
      if (avatarFile) {
        const base64 = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.readAsDataURL(avatarFile);
        });
        data.avatar = base64;
      } else if (avatarRemoved && user?.custom_avatar) data.avatar = null;
      if (Object.keys(data).length > 0) {
        await api.updateProfile(data);
        onSave?.();
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-block)] border border-[#30363d] w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#484f58] hover:text-white"><X size={20} /></button>
        <h2 className="text-xl font-black text-white mb-6">Редактирование профиля</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-[var(--bg-main)] border-2 border-[#30363d] overflow-hidden">
                <AvatarWithFallback src={avatarPreview || getAvatarUrl(avatarRemoved ? { ...user, custom_avatar: null } : user)} alt="" fallbackLetter={user?.username} className="w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <ImagePlus size={32} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <span className="text-[10px] text-[#8b949e]">Нажмите на аватар для загрузки (до 20 МБ)</span>
            {(avatarPreview || user?.custom_avatar) && !avatarRemoved && (
              <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null); setAvatarRemoved(true); }} className="text-[10px] text-red-400 hover:text-red-300">Сбросить аватар</button>
            )}
          </div>
          <div>
            <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider block mb-2">Никнейм</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={2} maxLength={30} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Ваш никнейм" />
          </div>
          <div>
            <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider block mb-2">Пол</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)]">
              <option value="">Не указан</option>
              <option value="Мужской">Мужской</option>
              <option value="Женский">Женский</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider block mb-2">Род занятий</label>
            <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Род занятий" />
          </div>
          <div>
            <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider block mb-2">Интересы</label>
            <input value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="Интересы" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-[#30363d] rounded-lg text-[#8b949e] font-bold hover:text-white transition-colors">Отмена</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-[var(--color-accent)] text-black rounded-lg font-black hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
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

export default function App() {
  const [view, setView] = useState('feed');
  const [activeNav, setActiveNav] = useState('forum');
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState('new');
  const [selectedThread, setSelectedThread] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ posts: 0, users: 0, display_users: 0, display_messages: 0 });
  const [latestComments, setLatestComments] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [toast, setToast] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [wallPosts, setWallPosts] = useState([]);
  const [profileTab, setProfileTab] = useState('wall');
  const [userProfileTab, setUserProfileTab] = useState('wall');
  const [rankLoading, setRankLoading] = useState(false);
  const [commentImages, setCommentImages] = useState([]);
  const commentImageInputRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const commentInputRef = useRef(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef(null);
  const [newPostImages, setNewPostImages] = useState([]);
  const newPostImageInputRef = useRef(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [postData, setPostData] = useState({ text: '', images: [], poll: { question: '', options: ['', ''] } });
  const [wallPollMode, setWallPollMode] = useState(false);
  const wallInputRef = useRef(null);
  const [wallEmojiPickerOpen, setWallEmojiPickerOpen] = useState(false);
  const [wallImagesOther, setWallImagesOther] = useState([]);
  const [wallEmojiPickerOpenOther, setWallEmojiPickerOpenOther] = useState(false);
  const [wallInputOther, setWallInputOther] = useState('');
  const wallImageInputRef = useRef(null);
  const wallEmojiPickerRef = useRef(null);
  const wallImageInputRefOther = useRef(null);
  const wallEmojiPickerRefOther = useRef(null);
  const wallContentRefOther = useRef(null);
  const [wallCommentsOpenPostId, setWallCommentsOpenPostId] = useState(null);
  const [wallCommentDrafts, setWallCommentDrafts] = useState({});
  const [adminTab, setAdminTab] = useState('trophies');
  const [adminTrophies, setAdminTrophies] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [grantTrophyTarget, setGrantTrophyTarget] = useState(null);
  const [profileTrophies, setProfileTrophies] = useState([]);
  const [selectedUserTrophies, setSelectedUserTrophies] = useState([]);
  const [selectedUserSubscriptions, setSelectedUserSubscriptions] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [selectedUserFollowersCount, setSelectedUserFollowersCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const [siteSettings, setSiteSettings] = useState({ site_name: 'FORUM.LIVE', site_logo: '', site_pattern: '', theme: null });

  const loadSiteSettings = useCallback(async () => {
    try {
      const s = await api.getSiteSettings();
      setSiteSettings(s);
    } catch {
      setSiteSettings({ site_name: 'FORUM.LIVE', site_logo: '', site_pattern: '' });
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const u = await api.getMe();
      setUser(u ? { ...u, id: u.id } : null);
    } catch {
      setUser(null);
      localStorage.removeItem('forum_token');
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPosts(activeTab, activeFilter);
      setPosts(data);
    } catch (e) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeFilter]);

  const loadStats = useCallback(async () => {
    try {
      const s = await api.getStats();
      setStats(s);
    } catch { }
  }, []);

  const loadLatestComments = useCallback(async () => {
    try {
      const list = await api.getLatestComments();
      setLatestComments(list || []);
    } catch { setLatestComments([]); }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    loadSiteSettings();
  }, [loadSiteSettings]);

  useEffect(() => {
    document.title = siteSettings.site_name || 'Forum';
  }, [siteSettings.site_name]);

  useEffect(() => {
    const root = document.documentElement;
    const t = siteSettings.theme;
    root.style.setProperty('--bg-main', t?.bg_main || '#0d1117');
    root.style.setProperty('--bg-block', t?.bg_block || '#161b22');
    root.style.setProperty('--text-primary', t?.text_primary || '#ffffff');
    root.style.setProperty('--color-accent', t?.color_accent || '#10b981');
    root.style.setProperty('--bg-widget', t?.bg_widget || '#13131f');
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const widgetColorHex = t?.bg_widget || '#13131f';
    const widgetOpacity = typeof t?.widget_opacity === 'number' ? t.widget_opacity : 0.7;
    root.style.setProperty('--bg-widget-glass', hexToRgba(widgetColorHex, widgetOpacity));
    const blockColorHex = t?.bg_block || '#161b22';
    const blockOpacity = typeof t?.block_opacity === 'number' ? t.block_opacity : 0.8;
    root.style.setProperty('--bg-block-glass', hexToRgba(blockColorHex, blockOpacity));
    const profileColorHex = t?.bg_profile || '#1a0b2e';
    const profileOpacity = typeof t?.profile_opacity === 'number' ? t.profile_opacity : 0.8;
    root.style.setProperty('--bg-profile-glass', hexToRgba(profileColorHex, profileOpacity));
  }, [siteSettings.theme]);

  useEffect(() => {
    if (activeNav === 'forum' && view === 'feed') loadPosts();
  }, [activeNav, view, activeTab, activeFilter, loadPosts]);

  useEffect(() => {
    loadStats();
  }, [loadStats, posts.length]);

  useEffect(() => {
    if (view === 'feed' && activeNav === 'forum') loadLatestComments();
  }, [view, activeNav, loadLatestComments, comments.length]);

  useEffect(() => {
    if (selectedThread?.id) {
      api.getComments(selectedThread.id).then(setComments).catch(() => setComments([]));
    }
  }, [selectedThread?.id]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    setChatLoading(true);
    try {
      const list = await api.getConversations(user.id);
      setConversations(list);
    } catch {
      setConversations([]);
    } finally {
      setChatLoading(false);
    }
  }, [user?.id]);

  const loadChatHistory = useCallback(async () => {
    if (!user?.id || !activeChatUser?.id) return;
    setChatLoading(true);
    try {
      const list = await api.getChatHistory(user.id, activeChatUser.id);
      setChatHistory(list);
    } catch {
      setChatHistory([]);
    } finally {
      setChatLoading(false);
    }
  }, [user?.id, activeChatUser?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if ((view === 'messages' || view === 'profile') && user?.id) loadConversations();
  }, [view, user?.id, loadConversations]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const handleStartChat = useCallback((targetUser) => {
    const u = targetUser?.id ? { ...targetUser } : { id: targetUser?.contactId, username: targetUser?.username || 'user', custom_avatar: targetUser?.avatar, last_online: targetUser?.last_online };
    if (activeChatUser?.id === u?.id) {
      setView('messages');
      return;
    }
    setChatLoading(true);
    setActiveChatUser(u);
    setChatHistory([]);
    setView('messages');
  }, [activeChatUser?.id]);

  const openChatWithUser = useCallback((contact) => {
    const contactId = contact?.contactId ?? contact?.id;
    if (activeChatUser?.id === contactId) return;
    const u = contact?.id ? { ...contact, id: contact.id } : { id: contactId, username: contact?.username || 'user', custom_avatar: contact?.avatar, last_online: contact?.last_online };
    setChatLoading(true);
    setActiveChatUser(u);
    setChatHistory([]);
  }, [activeChatUser?.id]);

  const handleSendPrivateMessage = useCallback(async (content) => {
    if (!user?.id || !activeChatUser?.id) return;
    try {
      const msg = await api.sendPrivateMessage(user.id, activeChatUser.id, content);
      setChatHistory(prev => [...prev, { ...msg, isMine: true }]);
      loadConversations();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка отправки', type: 'error' });
    }
  }, [user?.id, activeChatUser?.id, loadConversations]);

  useEffect(() => {
    if (view === 'profile' && user?.id) {
      api.getPostsByAuthor(user.id).then(setUserPosts).catch(() => setUserPosts([]));
      api.getWall(user.id).then(setWallPosts).catch(() => setWallPosts([]));
      api.getSubscriptions(user.id).then(setSubscriptions).catch(() => setSubscriptions([]));
      api.getUserTrophies(user.id).then(setProfileTrophies).catch(() => setProfileTrophies([]));
      api.getFollowers(user.id).then((f) => setFollowersCount(f.length)).catch(() => setFollowersCount(0));
    }
  }, [view, user?.id]);

  useEffect(() => {
    if (view === 'profile' && selectedUser?.id) {
      api.getPostsByAuthor(selectedUser.id).then(setSelectedUserPosts).catch(() => setSelectedUserPosts([]));
      api.getWall(selectedUser.id).then(setWallPosts).catch(() => setWallPosts([]));
      api.getUserTrophies(selectedUser.id).then(setSelectedUserTrophies).catch(() => setSelectedUserTrophies([]));
      api.getSubscriptions(selectedUser.id).then(setSelectedUserSubscriptions).catch(() => setSelectedUserSubscriptions([]));
      setSelectedUserFollowersCount(selectedUser.followers_count ?? 0);
      setIsFollowingUser(selectedUser.is_following ?? false);
    }
  }, [view, selectedUser?.id, selectedUser?.followers_count, selectedUser?.is_following]);

  useEffect(() => {
    if (view === 'admin' && (user?.is_admin || user?.id === 1 || user?.username === 'admin_dev')) {
      api.getTrophies().then(setAdminTrophies).catch(() => setAdminTrophies([]));
      api.getAdminUsers().then(setAdminUsers).catch(() => setAdminUsers([]));
    }
  }, [view, user?.id, user?.is_admin, user?.username]);

  const loadCategories = useCallback(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (view === 'profile' && profileTab === 'feed' && user?.id) {
      api.getActivityFeed().then(setActivityFeed).catch(() => setActivityFeed([]));
    }
  }, [view, profileTab, user?.id]);

  useEffect(() => {
    if (!selectedThread) setReplyTo(null);
  }, [selectedThread?.id]);

  const openUserProfile = useCallback(async (userId) => {
    if (!userId) return;
    if (userId === user?.id) {
      setSelectedUser(null);
      setView('profile');
      return;
    }
    setLoading(true);
    try {
      const profileUser = await api.getUserProfile(userId);
      setSelectedUser(profileUser);
      setView('profile');
      window.scrollTo(0, 0);
    } catch {
      setSelectedUser(null);
      setToast({ message: 'Пользователь не найден', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const form = e.target;
    const loginVal = form.elements.login?.value?.trim();
    const emailVal = form.elements.email?.value?.trim();
    const passVal = form.elements.password?.value || '';

    if (!loginVal || !passVal) {
      setAuthError('Заполните логин и пароль');
      setAuthLoading(false);
      return;
    }
    if (authMode === 'register') {
      if (!emailVal) {
        setAuthError('Введите email');
        setAuthLoading(false);
        return;
      }
      if (passVal.length < 4) {
        setAuthError('Пароль минимум 4 символа');
        setAuthLoading(false);
        return;
      }
    }

    try {
      const data = authMode === 'login'
        ? await api.login(loginVal, passVal)
        : await api.register(loginVal, emailVal, passVal);
      const { user: u, token } = data || {};
      if (!token || !u) {
        setAuthError('Неверный ответ сервера');
        return;
      }
      localStorage.setItem('forum_token', token);
      setUser(u);
      setShowAuth(false);
      setAuthError('');
    } catch (err) {
      setAuthError(err?.message || 'Ошибка');
      setToast({ message: err?.message || 'Ошибка авторизации', type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('forum_token');
    setUser(null);
  };

  const handleVote = async (post, type, e) => {
    e.stopPropagation();
    if (!user) {
      setShowAuth(true);
      setAuthMode('login');
      return;
    }
    const vote = type === 'up' ? 1 : -1;
    const prev = votes[post.id] || 0;
    const newVote = prev === vote ? 0 : vote;
    setVotes(v => ({ ...v, [post.id]: newVote }));
    try {
      const { votes: newTotal } = await api.votePost(post.id, vote);
      setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, votes: newTotal } : p));
      if (selectedThread?.id === post.id) setSelectedThread((prev) => prev ? { ...prev, votes: newTotal } : null);
    } catch {
      setVotes(v => ({ ...v, [post.id]: prev }));
    }
  };

  const openThread = async (post) => {
    setLoading(true);
    try {
      const full = await api.getPost(post.id);
      setSelectedThread(full);
      setView('thread');
      window.scrollTo(0, 0);
    } catch {
      setSelectedThread(null);
    } finally {
      setLoading(false);
    }
  };

  const displayCategories = (categories.length ? categories : DEFAULT_CATEGORIES).filter((c) => c.id !== 'messages');
  const messagesConfig = categories?.find((c) => c.id === 'messages' || c.slug === 'messages' || c.name === 'Сообщения') || { id: 'messages', name: 'Сообщения', icon: 'MessageSquare', color: '#3b82f6' };
  const getCategoryName = (id) => {
    const cat = displayCategories.find(c => c.id === id);
    if (cat) return cat.name;
    return DIRECT_POST_CATEGORIES.includes(id) ? id : 'Форум';
  };
  const getCategoryStyle = (id) => {
    const cat = displayCategories.find(c => c.id === id);
    return { icon: cat?.icon || 'Folder', color: cat?.color || '#10b981' };
  };

  const getTabForCategory = (category) => {
    const map = { Backend: 'dev', Frontend: 'dev', Languages: 'dev', Security: 'sec', DevOps: 'sys', Career: 'career' };
    return map[category] || 'all';
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title?.value?.trim();
    const content = form.elements.content?.value?.trim();
    const category = form.elements.category?.value;
    const tags = form.elements.tags?.value?.trim() || '';
    if (!user) {
      setShowAuth(true);
      setAuthMode('login');
      setToast({ message: 'Войдите для публикации', type: 'error' });
      return;
    }
    if (!title || !content || !category) return;
    try {
      await api.createPost(title, content, category, tags, newPostImages);
      setView('feed');
      setNewPostImages([]);
      loadPosts();
      loadStats();
      setToast({ message: 'Тема опубликована!', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const input = e.target.elements.comment;
    const content = input?.value?.trim();
    if ((!content && commentImages.length === 0) || !selectedThread) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const comment = await api.addComment(selectedThread.id, content || '', commentImages, replyTo?.id || null);
      const enriched = { ...comment, author_avatar: getAvatarUrl(user), rank: user.rank, rank_color: user.rank_color, likes: 0, liked: false };
      setComments(prev => [...prev, enriched]);
      input.value = '';
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto';
        commentInputRef.current.style.height = '44px';
      }
      setCommentImages([]);
      setReplyTo(null);
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleLikeComment = async (comment) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const { likes } = await api.likeComment(selectedThread.id, comment.id);
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes, liked: !c.liked } : c));
    } catch {
      setToast({ message: 'Ошибка лайка', type: 'error' });
    }
  };

  const resetPostData = () => {
    setPostData({ text: '', images: [], poll: { question: '', options: ['', ''] } });
    setWallPollMode(false);
    if (wallInputRef.current) wallInputRef.current.style.height = '44px';
  };

  const profileUserId = selectedUser?.id || user?.id;
  const handleVoteWallPoll = async (postId, optionIndex) => {
    if (!user || !profileUserId) return;
    try {
      const { poll_options_with_votes, poll_user_vote } = await api.voteWallPoll(profileUserId, postId, optionIndex);
      setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, poll_options_with_votes, poll_user_vote } : p));
    } catch {
      setToast({ message: 'Ошибка голосования', type: 'error' });
    }
  };
  const handleLikeWallPost = async (postId) => {
    if (!user || !profileUserId) return;
    try {
      const { likes, liked } = await api.likeWallPost(profileUserId, postId);
      setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, likes, liked } : p));
    } catch {
      setToast({ message: 'Ошибка лайка', type: 'error' });
    }
  };

  const handleWallCommentSubmit = async (postId, content) => {
    if (!user || !profileUserId || !content?.trim()) return;
    try {
      const comment = await api.addWallComment(profileUserId, postId, content.trim());
      setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p));
      setWallCommentDrafts(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handlePostWall = async (e) => {
    e.preventDefault();
    const { text, images, poll } = postData;
    const hasText = text.trim().length > 0;
    const hasImages = images && images.length > 0;
    const hasPoll = poll?.question?.trim() && Array.isArray(poll?.options) && poll.options.filter(Boolean).length >= 2;
    if ((!hasText && !hasImages && !hasPoll) || !user) return;
    if (wallPollMode && !poll?.question?.trim()) {
      setToast({ message: 'Введите вопрос голосования', type: 'error' });
      return;
    }
    if (wallPollMode && (!poll?.options?.filter(Boolean).length || poll.options.filter(Boolean).length < 2)) {
      setToast({ message: 'Добавьте минимум 2 варианта ответа', type: 'error' });
      return;
    }
    try {
      const post = await api.postWall(user.id, text.trim(), null, null, images || [], hasPoll ? poll.question.trim() : null, hasPoll ? poll.options.filter(Boolean) : null);
      setWallPosts(prev => [post, ...prev]);
      resetPostData();
      setToast({ message: 'Опубликовано на стене', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const searchTimeoutRef = useRef(null);
  useEffect(() => () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); }, []);
  const onSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (q.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        api.search(q).then(setSearchResults);
        searchTimeoutRef.current = null;
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const displayUser = selectedUser || user;

  const gradientBorderProfile = {
    border: '1px solid transparent',
    background: 'linear-gradient(var(--bg-profile-glass), var(--bg-profile-glass)) padding-box, linear-gradient(to bottom right, rgba(168, 85, 247, 0.4), transparent) border-box',
    backgroundClip: 'padding-box, border-box',
  };
  const gradientBorderWidget = {
    border: '1px solid transparent',
    background: 'linear-gradient(var(--bg-widget-glass), var(--bg-widget-glass)) padding-box, linear-gradient(to bottom right, rgba(168, 85, 247, 0.4), transparent) border-box',
    backgroundClip: 'padding-box, border-box',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textMain} font-sans selection:bg-[var(--color-accent)]/30 relative overflow-x-hidden`}>
      {siteSettings.site_pattern && (
        <div
          className="fixed inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url(${siteSettings.site_pattern})`,
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
          }}
          aria-hidden
        />
      )}
      <div className="w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full fixed -top-[10%] -left-[10%] z-0 pointer-events-none" aria-hidden />
      <div className="w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full fixed bottom-[10%] right-0 z-0 pointer-events-none" aria-hidden />
      <div className="relative z-10">
      <div className={`h-9 bg-[#010409] border-b ${theme.border} hidden lg:block`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-full flex items-center justify-between text-[11px] font-bold text-[#8b949e]">
          <div className="flex gap-6 uppercase tracking-wider h-full">
            {TOP_NAV.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); setView('feed'); }}
                className={`transition-colors h-full px-1 border-b-2 ${activeNav === item.id ? 'text-white border-[var(--color-accent)]' : 'border-transparent hover:text-white'}`}
              >
                <span className={item.color || ''}>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Zap size={12} className="text-[var(--color-accent)]" /> Пользователей: {stats.display_users ?? stats.users ?? 0}</span>
            <span className="text-[#30363d]">|</span>
            <span>Темы: {stats.posts || 0}</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[var(--bg-main)]/90 backdrop-blur-md border-b border-[#30363d] py-5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex items-center gap-6">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setView('feed'); setActiveTab('all'); setActiveNav('forum'); }}>
            {siteSettings.site_logo ? (
              <img src={siteSettings.site_logo} alt="" className="w-11 h-11 rounded-lg object-cover shadow-lg shadow-[var(--color-accent)]/20 group-hover:rotate-3 transition-transform" />
            ) : (
              <div className="w-11 h-11 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[var(--color-accent)]/20 group-hover:rotate-3 transition-transform">IT</div>
            )}
            <span className="text-2xl font-bold tracking-tighter text-white">{siteSettings.site_name || 'FORUM.LIVE'}</span>
          </div>

          <div className="flex-1 max-w-xl relative hidden md:block">
            <Search className="absolute left-3 top-2.5 text-[#484f58]" size={16} />
            <input
              value={searchQuery}
              onChange={onSearch}
              className="w-full bg-[#010409] border border-[#30363d] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-accent)]/50 transition-all"
              placeholder="Поиск по обсуждениям..."
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-block)] border border-[#30363d] rounded-lg shadow-xl overflow-hidden z-50">
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => { openThread(p); setSearchResults([]); setSearchQuery(''); }} className="p-3 hover:bg-[#1c2128] cursor-pointer">
                    <div className="font-medium text-white break-all">{p.title}</div>
                    <div className="text-[10px] text-[#8b949e] flex items-center gap-2">
                      <span className="text-[var(--color-accent)]/80">{p.category}</span>
                      <span>•</span>
                      <span>{p.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {!user ? (
              <div className="flex gap-2">
                <button onClick={() => { setAuthMode('login'); setShowAuth(true); setAuthError(''); }} className="text-xs font-bold text-[#8b949e] hover:text-white px-2">ВХОД</button>
                <button onClick={() => { setAuthMode('register'); setShowAuth(true); setAuthError(''); }} className="bg-[var(--color-accent)] text-black px-4 py-2 rounded-md font-black text-xs hover:bg-[color:var(--color-accent)]/90 transition-all shadow-lg shadow-[var(--color-accent)]/10">РЕГИСТРАЦИЯ</button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                {(user?.is_admin || user?.id === 1 || user?.username === 'admin_dev') && (
                  <button onClick={() => setView('admin')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold uppercase transition-colors">
                    <Shield size={14} /> Админ
                  </button>
                )}
                <div onClick={() => { setSelectedUser(null); setView('profile'); }} className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white group-hover:text-[var(--color-accent)]">{user.username}</p>
                    <p className={`text-[9px] font-black uppercase tracking-tighter ${user.rank_color || getRankColor(user.rank)}`}>{user.rank || 'Юзер'}</p>
                  </div>
                  <div className="w-9 h-9 bg-slate-800 rounded-full border border-[#30363d] group-hover:border-[var(--color-accent)] transition-all overflow-hidden">
                    <AvatarWithFallback src={getAvatarUrl(user)} alt={user.username} fallbackLetter={user.username} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`max-w-[1400px] mx-auto px-6 md:px-8 py-6 grid grid-cols-1 gap-6 ${view === 'profile' || view === 'admin' || view === 'messages' ? 'lg:grid-cols-1' : 'lg:grid-cols-[250px_1fr_300px]'}`}>
        <aside className={`hidden space-y-6 ${view === 'profile' || view === 'admin' || view === 'messages' ? 'lg:hidden' : 'lg:block'}`}>
          <button
            onClick={() => user ? setView('editor') : (setShowAuth(true), setAuthMode('login'))}
            className="w-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-accent)] hover:text-black transition-all group"
          >
            <MessageSquarePlus size={18} /> СОЗДАТЬ ТЕМУ
          </button>

          <button
            onClick={() => { setView('messages'); setActiveChatUser(null); setChatHistory([]); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${view === 'messages' ? 'bg-[#1c2128]' : 'text-[#8b949e] hover:bg-[var(--bg-block)] hover:text-white'}`}
            style={view === 'messages' ? { color: messagesConfig.color || 'var(--color-accent)' } : {}}
          >
            {React.createElement(getIconComponent(messagesConfig?.icon || 'MessageSquare'), { size: 16 })}
            <span className="text-[13px] font-medium">{messagesConfig.name}</span>
          </button>

          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-[#484f58] uppercase tracking-[2px] px-4 mb-2">Разделы форума</h4>
            {displayCategories.map(cat => {
              const IconComp = LUCIDE_ICONS[cat.icon] || Folder;
              const color = cat.color || '#10b981';
              const isActive = activeTab === cat.id && view === 'feed' && activeNav === 'forum';
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.id); setView('feed'); setActiveNav('forum'); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive ? 'bg-[#1c2128]' : 'text-[#8b949e] hover:bg-[var(--bg-block)] hover:text-white'}`}
                >
                  <span style={isActive ? { color } : {}}><IconComp size={16} /></span>
                  <span className="text-[13px] font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 bg-[var(--bg-block)] border border-[#30363d] rounded-xl">
            <div className="flex items-center gap-2 text-white mb-3">
              <Award size={16} className="text-yellow-500" />
              <span className="text-[11px] font-black uppercase">Топ авторов</span>
            </div>
            <div className="space-y-3">
              {posts.slice(0, 3).map((p, i) => (
                <button key={p.id} type="button" onClick={() => p.author_id && openUserProfile(p.author_id)} className="w-full flex items-center gap-2 text-left hover:text-[var(--color-accent)] transition-colors group">
                  <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                    <AvatarWithFallback src={p.author_avatar && !isPlaceholderUrl(p.author_avatar) ? p.author_avatar : null} alt="" fallbackLetter={p.author} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-medium truncate">{p.author}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-5 min-w-0">
          {view === 'messages' && (
            <MessagesPage
              user={user}
              activeChatUser={activeChatUser}
              conversations={conversations}
              chatHistory={chatHistory}
              loading={chatLoading}
              onSelectContact={openChatWithUser}
              onSend={handleSendPrivateMessage}
              getAvatarUrl={getAvatarUrl}
            />
          )}

          {view === 'feed' && activeNav === 'forum' && (
            <>
              <div className="flex items-center gap-2 text-[11px] text-[#484f58] font-bold uppercase tracking-wider">
                <button onClick={() => { setActiveTab('all'); setView('feed'); }} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
                <ChevronRight size={12} />
                <button onClick={() => { setActiveTab(activeTab); setView('feed'); }} className="hover:text-[var(--color-accent)] transition-colors">{getCategoryName(activeTab).toUpperCase()}</button>
              </div>

              <div className="flex items-center justify-between bg-[var(--bg-block)] p-5 border border-[#30363d] rounded-xl">
                <div className="flex gap-4 text-xs font-bold">
                  <button onClick={() => setActiveFilter('new')} className={`transition-colors ${activeFilter === 'new' ? 'text-[var(--color-accent)]' : 'text-[#8b949e] hover:text-white'}`}>НОВЫЕ</button>
                  <button onClick={() => setActiveFilter('hot')} className={`transition-colors ${activeFilter === 'hot' ? 'text-[var(--color-accent)]' : 'text-[#8b949e] hover:text-white'}`}>ГОРЯЧИЕ</button>
                </div>
              </div>

              <div className="bg-[var(--bg-block-glass)] backdrop-blur-xl border border-[#30363d] rounded-xl overflow-hidden divide-y divide-[#30363d]">
                {loading ? (
                  <><PostSkeleton /><PostSkeleton /><PostSkeleton /><PostSkeleton /></>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center text-[#8b949e]">Нет тем в этом разделе</div>
                ) : (
                  posts.map(post => (
                    <PostCard key={post.id} post={post} votes={votes} onVote={handleVote} onClick={openThread} onAuthorClick={openUserProfile} categoryColor={getCategoryStyle(post.category)?.color} />
                  ))
                )}
              </div>
            </>
          )}

          {activeNav === 'articles' && (
            <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-8 text-center">
              <FileText size={48} className="mx-auto text-[#484f58] mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Статьи и гайды</h2>
              <p className="text-sm text-[#8b949e]">Раздел находится в разработке.</p>
              <button onClick={() => setActiveNav('forum')} className="mt-6 bg-[var(--color-accent)] text-black px-6 py-2 rounded-lg font-bold text-xs uppercase">Вернуться на форум</button>
            </div>
          )}

          {activeNav === 'rules' && (
            <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-black text-white italic border-b border-[#30363d] pb-4">ПРАВИЛА СООБЩЕСТВА</h2>
              <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-[var(--color-accent)] font-bold">1. Общие положения</p>
                <p>1.1. Будьте вежливы к коллегам по цеху. Оскорбления недопустимы.</p>
                <p>1.2. Запрещен спам, флуд и любая несогласованная реклама.</p>
                <p className="text-[var(--color-accent)] font-bold">2. Контент и Код</p>
                <p>2.1. Весь выкладываемый код должен быть безопасен для пользователей.</p>
                <p>2.2. При использовании чужого кода указывайте автора или лицензию.</p>
              </div>
              <button onClick={() => setActiveNav('forum')} className="w-full bg-[#30363d] text-white py-2 rounded font-bold text-xs uppercase hover:bg-[var(--color-accent)] hover:text-black transition-all">Я ознакомлен с правилами</button>
            </div>
          )}

          {view === 'thread' && selectedThread && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[11px] text-[#484f58] font-bold uppercase tracking-wider">
                <button onClick={() => { setActiveTab('all'); setView('feed'); }} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
                <ChevronRight size={12} />
                <button onClick={() => { setActiveTab(selectedThread.category); setView('feed'); }} className="hover:text-[var(--color-accent)] transition-colors">{selectedThread.category}</button>
              </div>
              <button onClick={() => setView('feed')} className="flex items-center gap-2 text-xs font-bold text-[#8b949e] hover:text-white mb-2 group transition-colors">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> НАЗАД К ЛЕНТЕ
              </button>

              <div className="bg-[var(--bg-block-glass)] backdrop-blur-xl border border-[#30363d] rounded-xl shadow-2xl">
                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <UserLink userId={selectedThread.author_id} username={selectedThread.author} avatarUrl={selectedThread.author_avatar || getAvatarUrl({ username: selectedThread.author })} rank={selectedThread.rank} rankColor={selectedThread.rank_color} size="lg" onClick={openUserProfile} />
                    <p className="text-[11px] text-[#8b949e] font-medium ml-2">{selectedThread.time} • {selectedThread.replies ?? comments.length} сообщений</p>
                  </div>

                  <h1 className="text-xl md:text-2xl font-black text-white leading-tight mb-6 break-all">{selectedThread.title}</h1>
                  {selectedThread.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedThread.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[10px] bg-[#30363d] text-[#8b949e] px-2 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-invert prose-emerald max-w-none break-all whitespace-pre-wrap">
                    <SimpleMarkdown>{selectedThread.content || ''}</SimpleMarkdown>
                  </div>
                  {(() => {
                    const imgs = (selectedThread.images?.length ? selectedThread.images : (selectedThread.image ? [selectedThread.image] : []));
                    if (imgs.length === 0) return null;
                    if (imgs.length === 1) return (
                      <div className="mt-4 overflow-hidden rounded-lg">
                        <img src={imgs[0]} alt="" className="max-h-80 w-auto object-contain" />
                      </div>
                    );
                    return (
                      <div className={`mt-4 grid gap-2 ${imgs.length === 2 ? 'grid-cols-2' : imgs.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {imgs.map((src, i) => (
                          <div key={i} className="rounded-lg overflow-hidden">
                            <img src={src} alt="" className="w-full max-h-48 object-cover" />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-[var(--bg-main)]/50 p-4 border-t border-[#30363d] flex items-center justify-between">
                  <ThreadActions
                    thread={selectedThread}
                    user={user}
                    onCopyLink={() => {
                      const url = `${window.location.origin}${window.location.pathname || '/'}?post=${selectedThread.id}`;
                      navigator.clipboard.writeText(url).then(() => setToast({ message: 'Ссылка скопирована', type: 'success' })).catch(() => setToast({ message: 'Не удалось скопировать', type: 'error' }));
                    }}
                    onRepost={async () => {
                      if (!user) { setShowAuth(true); return; }
                      try {
                        const link = `${window.location.origin}${window.location.pathname || '/'}?post=${selectedThread.id}`;
                        await api.postWall(user.id, `Репост: ${selectedThread.title}\n${link}`, selectedThread.id, selectedThread.title);
                        setToast({ message: 'Опубликовано в профиле', type: 'success' });
                      } catch (err) {
                        setToast({ message: err?.message || 'Ошибка', type: 'error' });
                      }
                    }}
                    setToast={setToast}
                  />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-4 bg-transparent">
                <h5 className="text-[11px] font-black text-[#484f58] uppercase tracking-widest pl-2">Комментарии ({comments.length})</h5>
                {(() => {
                  const roots = comments.filter(c => !c.parent_id);
                  const byParent = comments.reduce((acc, c) => {
                    const pid = c.parent_id ?? 'root';
                    if (!acc[pid]) acc[pid] = [];
                    acc[pid].push(c);
                    return acc;
                  }, {});
                  const renderComment = (c, isNested = false) => {
                    const isAuthorOrMod = c.author_id === selectedThread?.author_id || c.rank === 'Модератор';
                    return (
                  <div key={c.id} className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-3 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 shadow-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.25),0_0_0_1px_rgba(168,85,247,0.08)] group/comment ${isNested ? 'ml-10' : ''} ${isAuthorOrMod ? 'border-l-2 border-l-[var(--color-accent)]' : ''}`}>
                    <div className="flex gap-4 items-start">
                      <button type="button" onClick={() => openUserProfile?.(c.author_id)} className="flex-shrink-0 hover:opacity-90 transition-opacity text-left pt-1">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/5">
                          <AvatarWithFallback src={c.author_avatar || getAvatarUrl({ username: c.author })} alt={c.author} fallbackLetter={c.author} className="w-full h-full object-cover" />
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-white font-bold text-[15px]">{c.author}</span>
                          {c.rank && <UserBanner rank={c.rank} color={c.rank_color || getRankColor(c.rank)} />}
                          <span className="text-xs text-white/30">{c.time}</span>
                        </div>
                        <p className="text-white/90 leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
                        {(() => {
                          const imgs = (c.images?.length ? c.images : (c.image ? [c.image] : []));
                          if (imgs.length === 0) return null;
                          if (imgs.length === 1) return (
                            <div className="mt-3 overflow-hidden max-w-xs rounded-lg">
                              <img src={imgs[0]} alt="" className="max-h-48 w-auto object-contain" />
                            </div>
                          );
                          return (
                            <div className={`mt-3 grid gap-2 ${imgs.length === 2 ? 'grid-cols-2' : imgs.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                              {imgs.map((src, i) => (
                                <div key={i} className="rounded-lg overflow-hidden">
                                  <img src={src} alt="" className="w-full max-h-40 object-cover" />
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        <div className="flex items-center gap-4 mt-3 pt-3 bg-white/[0.02] rounded-lg -mx-1 px-3 -mb-1 opacity-50 group-hover/comment:opacity-100 transition-opacity duration-300">
                          <button type="button" onClick={() => { setReplyTo({ id: c.id, author: c.author }); setTimeout(() => commentInputRef.current?.focus(), 0); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors duration-300">
                            <MessageCircle size={10} />
                            Ответить
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLikeComment(c)}
                            className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${c.liked ? 'text-red-500' : 'text-gray-500 hover:text-blue-400'}`}
                          >
                            <Heart size={10} className={c.liked ? 'fill-current' : ''} />
                            {c.likes ?? 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                  };
                  return (
                    <div className="space-y-0">
                      {roots.map(root => (
                        <div key={root.id}>
                          {renderComment(root)}
                          {(byParent[root.id] || []).map(child => renderComment(child, true))}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {user ? (
                  <form onSubmit={handleAddComment} className="border-t border-white/10 pt-6">
                    <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl focus-within:border-[var(--color-accent)]/50 transition-all">
                      {replyTo && (
                        <div className="flex items-center justify-between py-2 px-2 mb-3 border-b border-white/5">
                          <span className="text-xs text-gray-400">Ответ на <span className="text-[var(--color-accent)] font-medium">@{replyTo.author}</span></span>
                          <button type="button" onClick={() => setReplyTo(null)} className="p-1 text-[#484f58] hover:text-white transition-colors rounded" aria-label="Отмена"><X size={14} /></button>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden ring-1 ring-white/5">
                          <AvatarWithFallback src={getAvatarUrl(user)} alt="" fallbackLetter={user?.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0 w-full">
                          <div className="pb-4">
                            <textarea
                              ref={commentInputRef}
                              name="comment"
                              rows={1}
                              onInput={(e) => {
                                const ta = e.target;
                                ta.style.height = 'auto';
                                ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
                              }}
                              className="w-full min-h-[44px] max-h-[200px] py-3 px-3 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-sm text-white placeholder:text-white/20 overflow-y-auto"
                              placeholder={replyTo ? `Ответить ${replyTo.author}...` : 'Написать ответ...'}
                            />
                            {commentImages.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2">
                                {commentImages.map((src, i) => (
                                  <div key={i} className="relative flex-shrink-0">
                                    <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover ring-1 ring-white/10" />
                                    <button type="button" onClick={() => setCommentImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors"><X size={10} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <footer className="flex justify-between items-center w-full mt-4 pt-2 border-t border-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                              <button type="button" onClick={() => commentImageInputRef.current?.click()} className="bg-white/5 p-2 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-all duration-300 cursor-pointer" title="Прикрепить фото"><Paperclip size={14} /></button>
                              <div className="relative" ref={emojiPickerRef}>
                                <button type="button" onClick={() => setEmojiPickerOpen(v => !v)} className="bg-white/5 p-2 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-all duration-300 cursor-pointer" title="Эмодзи"><Smile size={14} /></button>
                                {emojiPickerOpen && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setEmojiPickerOpen(false)} aria-hidden />
                                    <div className="absolute bottom-full left-0 mb-1 w-[600px] max-w-[min(42rem,calc(100vw-2rem))] p-5 bg-[var(--bg-block)] border border-white/10 rounded-xl shadow-xl z-50 grid grid-cols-12 gap-3 max-h-64 overflow-y-auto">
                                      {['😀','😊','😂','👍','❤️','😍','🤔','😎','🎉','😅','🔥','✨','👏','🙏','💪','😢','🤗','😇','🥳','😤'].map((emo, i) => (
                                        <button key={i} type="button" onClick={() => {
                                          const ta = commentInputRef.current;
                                          if (ta) {
                                            const start = ta.selectionStart, end = ta.selectionEnd;
                                            const text = ta.value;
                                            ta.value = text.slice(0, start) + emo + text.slice(end);
                                            ta.selectionStart = ta.selectionEnd = start + emo.length;
                                            ta.focus();
                                          }
                                          setEmojiPickerOpen(false);
                                        }} className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded transition-colors">{emo}</button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors shrink-0 ml-4"><Send size={14} /> Отправить</button>
                          </footer>
                        </div>
                      </div>
                    </div>
                    <input ref={commentImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                      const files = [...(e.target.files || [])];
                      const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                      if (files.length !== valid.length) setToast({ message: 'Фото до 5 МБ каждое', type: 'error' });
                      if (valid.length === 0) return;
                      Promise.all(valid.map(f => new Promise((res) => {
                        const r = new FileReader();
                        r.onload = () => res(r.result);
                        r.readAsDataURL(f);
                      }))).then(urls => setCommentImages(prev => [...prev, ...urls].slice(0, 10)));
                      e.target.value = '';
                    }} />
                  </form>
                ) : (
                  <div className="border-t border-white/10 pt-6 text-center text-[#8b949e] text-sm">
                    <button onClick={() => setShowAuth(true)} className="text-[var(--color-accent)] hover:underline">Войдите</button>, чтобы оставить комментарий
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'editor' && (
            <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[#30363d] bg-[var(--bg-main)]/50 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-white">Новое обсуждение</span>
                <button onClick={() => setView('feed')} className="text-[#484f58] hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handlePublish} className="p-6 md:p-8 space-y-4">
                <input name="title" className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-3 text-lg font-bold text-white focus:outline-none focus:border-[var(--color-accent)] transition-all" placeholder="Заголовок темы..." required />
                <div className="flex gap-2 flex-wrap">
                  <select name="category" className="bg-[var(--bg-main)] border border-[#30363d] rounded px-3 py-1.5 text-xs font-bold text-[var(--color-accent)]" required>
                    <option value="">Выбрать раздел</option>
                    {(categories.filter(c => DIRECT_POST_CATEGORIES.includes(c.id)).length ? categories.filter(c => DIRECT_POST_CATEGORIES.includes(c.id)) : DIRECT_POST_CATEGORIES.map(id => ({ id, name: id }))).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input name="tags" className="flex-1 min-w-[120px] bg-[var(--bg-main)] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#8b949e]" placeholder="Теги (через запятую)..." />
                </div>
                <textarea name="content" className="w-full h-64 bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-4 text-sm text-[#c9d1d9] resize-none focus:outline-none focus:border-[var(--color-accent)]" placeholder="Напишите содержимое здесь... (Поддерживается Markdown)" required />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => newPostImageInputRef.current?.click()} className="p-2 rounded-lg border border-[#30363d] hover:border-[var(--color-accent)]/50 text-[#8b949e] hover:text-[var(--color-accent)] transition-colors" title="Прикрепить фото"><Image size={18} /></button>
                  <input ref={newPostImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                    const files = [...(e.target.files || [])];
                    const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                    if (files.length !== valid.length) setToast({ message: 'Фото до 5 МБ каждое', type: 'error' });
                    if (valid.length === 0) return;
                    Promise.all(valid.map(f => new Promise((res) => {
                      const r = new FileReader();
                      r.onload = () => res(r.result);
                      r.readAsDataURL(f);
                    }))).then(urls => setNewPostImages(prev => [...prev, ...urls].slice(0, 10)));
                    e.target.value = '';
                  }} />
                </div>
                {newPostImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                    {newPostImages.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={src} alt="" className="max-h-24 rounded-lg border border-[#30363d] object-cover" />
                        <button type="button" onClick={() => setNewPostImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setView('feed')} className="px-6 py-2 text-sm font-bold text-[#8b949e] hover:text-white transition-colors">ОТМЕНА</button>
                  <button type="submit" className="bg-[var(--color-accent)] text-black px-8 py-2 rounded-lg font-black text-xs hover:bg-[color:var(--color-accent)]/90 transition-all shadow-lg shadow-[var(--color-accent)]/20">ОПУБЛИКОВАТЬ</button>
                </div>
              </form>
            </div>
          )}

          {view === 'admin' && (user?.is_admin || user?.id === 1 || user?.username === 'admin_dev') && (
            <AdminPanel
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              adminTrophies={adminTrophies}
              setAdminTrophies={setAdminTrophies}
              adminUsers={adminUsers}
              grantTrophyTarget={grantTrophyTarget}
              setGrantTrophyTarget={setGrantTrophyTarget}
              setToast={setToast}
              setView={setView}
              getAvatarUrl={getAvatarUrl}
              categories={categories}
              loadCategories={loadCategories}
              refreshSiteSettings={loadSiteSettings}
              onPreviewPattern={(p) => setSiteSettings(s => ({ ...s, site_pattern: p || '' }))}
            />
          )}

          {view === 'profile' && (
            <div className="w-full">
              {!displayUser ? (
                <div className="backdrop-blur-xl rounded-xl p-12 text-center" style={gradientBorderProfile}>
                  <User size={56} className="mx-auto text-[#666] mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Личный кабинет</h2>
                  <p className="text-sm text-[#888] mb-6">Войдите, чтобы управлять профилем</p>
                  <button onClick={() => setShowAuth(true)} className="bg-[var(--color-accent)] text-black px-6 py-2 rounded-lg font-bold text-xs uppercase hover:bg-[color:var(--color-accent)]/90 transition-colors">ВОЙТИ</button>
                </div>
              ) : (
              <>
              <div className="flex items-center gap-2 text-[11px] text-[#666] font-bold uppercase tracking-wider mb-6">
                <button onClick={() => setView('feed')} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
                <ChevronRight size={12} />
                <span className="text-[var(--color-accent)]">Профиль</span>
                <ChevronRight size={12} />
                <span className="text-white">{displayUser?.username}</span>
              </div>
              <div className="backdrop-blur-xl rounded-2xl overflow-hidden" style={gradientBorderProfile}>
                <ProfileBanner
                  coverUrl={displayUser?.cover_url}
                  isOwnProfile={!selectedUser}
                  onCoverChange={!selectedUser ? async (cover) => {
                    try {
                      const updated = await api.updateProfile({ cover });
                      setUser((prev) => (prev ? { ...prev, cover_url: updated.cover_url } : null));
                      setToast({ message: 'Обложка обновлена', type: 'success' });
                    } catch (err) {
                      setToast({ message: err?.message || 'Ошибка загрузки обложки', type: 'error' });
                    }
                  } : undefined}
                />
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 min-h-0 px-6 pt-0 pb-6">
                <aside className="flex flex-col gap-4 w-full lg:w-[300px] pt-16">
                  <div className="flex flex-col items-center text-center">
                    {(() => {
                      const glowStyles = getAvatarGlowStyles(displayUser?.rank);
                      return (
                        <div className="w-36 h-36 rounded-full overflow-hidden border-4 -mt-24 relative z-10 hover:scale-105 transition-transform duration-300" style={glowStyles}>
                          <AvatarWithFallback src={getAvatarUrl(displayUser)} alt={displayUser?.username} fallbackLetter={displayUser?.username} className="w-full h-full object-cover" />
                        </div>
                      );
                    })()}
                    <h2 className="text-lg font-black text-white truncate w-full mt-3" title={displayUser?.username}>{displayUser?.username}</h2>
                    <div className="mt-2">
                        <RankBadge
                          userId={displayUser?.id}
                          currentRank={displayUser?.rank}
                          currentColor={displayUser?.rank_color}
                          isAdmin={user?.is_admin ?? (user?.id === 1 || user?.username === 'admin_dev')}
                          loading={rankLoading}
                          glow
                          onRankChange={async (rank) => {
                            setRankLoading(true);
                            try {
                              const updated = await api.setUserRank(displayUser?.id, rank);
                              if (selectedUser) setSelectedUser(prev => prev ? { ...prev, rank: updated.rank, rank_color: updated.rank_color } : null);
                              else setUser(prev => prev ? { ...prev, rank: updated.rank, rank_color: updated.rank_color } : null);
                              setToast({ message: `Звание изменено на ${rank}`, type: 'success' });
                            } catch (err) {
                              setToast({ message: err?.message || 'Ошибка', type: 'error' });
                            } finally {
                              setRankLoading(false);
                            }
                          }}
                        />
                      </div>
                  </div>
                  <div className="backdrop-blur-xl rounded-2xl p-4 w-full shadow-xl shadow-black/20" style={gradientBorderWidget}>
                    <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{displayUser?.reputation ?? 0}</div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">РЕПУТАЦИЯ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{selectedUser ? (selectedUser.posts_count ?? selectedUserPosts.length) : userPosts.length}</div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">ТЕМ</div>
                      </div>
                    </div>
                    {!selectedUser && (
                      <button onClick={() => setShowProfileEdit(true)} type="button" className="w-full mt-4 flex items-center justify-center gap-2 h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm font-medium">
                        <Pencil size={16} className="w-4 h-4" /> Редактировать
                      </button>
                    )}
                    {user && selectedUser && selectedUser.id !== user.id && (
                      <div className="flex flex-col gap-3 w-full mt-4">
                        <button
                          type="button"
                          onClick={() => handleStartChat(selectedUser)}
                          className="w-full h-11 rounded-lg flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:opacity-90 text-white transition-all text-sm font-medium"
                        >
                          <MessageSquare size={16} className="w-4 h-4" /> Написать сообщение
                        </button>
                        <button
                          type="button"
                          disabled={followLoading}
                          onClick={async () => {
                            setFollowLoading(true);
                            try {
                              const res = await api.toggleFollow(selectedUser.id);
                              setIsFollowingUser(res.followed);
                              setSelectedUserFollowersCount(res.followersCount);
                              setSelectedUser(prev => prev ? { ...prev, followers_count: res.followersCount, is_following: res.followed } : null);
                              setToast({ message: res.followed ? 'Подписка оформлена' : 'Отписка выполнена', type: 'success' });
                            } catch (err) {
                              setToast({ message: err?.message || 'Ошибка', type: 'error' });
                            } finally {
                              setFollowLoading(false);
                            }
                          }}
                          className="w-full h-11 rounded-lg flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-all text-sm font-medium disabled:opacity-50"
                        >
                          {isFollowingUser ? <><UserMinus size={16} className="w-4 h-4" /> Отписаться</> : <><UserPlus size={16} className="w-4 h-4" /> Подписаться</>}
                        </button>
                      </div>
                    )}
                    {!selectedUser && (
                      <button onClick={handleLogout} className="w-full mt-4 h-10 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black hover:bg-red-500 hover:text-white transition-all">
                        ВЫХОД
                      </button>
                    )}
                  </div>
                  <div className="bg-[var(--bg-widget-glass)] backdrop-blur-xl border border-white/10 border-l-4 border-l-[#a855f7] rounded-2xl overflow-hidden shadow-xl shadow-black/20" style={{ boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                      <h4 className="text-[10px] font-extrabold text-[var(--color-accent)] uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare size={12} className="text-[#a855f7]" /> МОИ ЧАТЫ
                      </h4>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-3 space-y-1 scrollbar-thin-purple">
                      {!user ? (
                        <p className="text-[11px] text-gray-500 py-2">Войдите для просмотра чатов</p>
                      ) : conversations.length === 0 ? (
                        <p className="text-[11px] text-gray-500 py-2 italic">Здесь будут ваши диалоги</p>
                      ) : (
                        conversations.map((c) => {
                          const isUserOnline = isOnline(c);
                          return (
                          <button
                            key={c.contactId}
                            type="button"
                            onClick={() => handleStartChat(c)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 hover:scale-[1.02] hover:brightness-110 transition-all duration-200 cursor-pointer text-left"
                          >
                            <div className="relative flex-shrink-0">
                              <div className="w-9 h-9 rounded-full overflow-hidden">
                                <AvatarWithFallback src={c.avatar} alt={c.username} fallbackLetter={c.username} className="w-full h-full object-cover" />
                              </div>
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f13] ${isUserOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`} title={isUserOnline ? 'в сети' : 'офлайн'} />
                            </div>
                            <span className="text-sm font-medium text-white truncate flex-1">{c.username}</span>
                          </button>
                        ); })
                      )}
                    </div>
                  </div>
                  <div className="bg-[var(--bg-widget-glass)] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20" style={{ boxShadow: 'inset 0 0 15px rgba(255,255,255,0.02), 0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <h4 className="text-[10px] font-extrabold text-[var(--color-accent)] uppercase tracking-[0.2em] flex items-center">
                        ПОДПИСКИ
                        <span className="ml-2 px-2 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-[10px] rounded-full font-bold">{(selectedUser ? selectedUserSubscriptions : subscriptions).length}</span>
                      </h4>
                      {(selectedUser ? selectedUserSubscriptions : subscriptions).length > 0 && (
                        <button type="button" onClick={() => selectedUser ? setUserProfileTab('subscriptions') : setProfileTab('subscriptions')} className="text-[10px] font-bold text-[var(--color-accent)] hover:underline">
                          Смотреть всех
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      {(selectedUser ? selectedUserSubscriptions : subscriptions).length === 0 ? (
                        <p className="text-[11px] text-gray-500">Нет подписок</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {(selectedUser ? selectedUserSubscriptions : subscriptions).slice(0, 8).map(s => (
                            <button key={s.id} type="button" onClick={() => openUserProfile(s.id)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 hover:scale-105 hover:brightness-110 transition-all duration-200" title={s.username}>
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                                <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-medium text-white truncate w-full text-center">{s.username}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
                <main className="flex-1 min-w-0 overflow-y-auto pt-4 lg:pt-6">
                  <div className="backdrop-blur-xl rounded-xl p-6 md:p-8 flex flex-col gap-y-6" style={gradientBorderProfile}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 pb-6 border-b border-white/5">
                      <div>
                        <h3 className="text-[11px] font-bold tracking-wider text-white/40 uppercase mb-1">Регистрация</h3>
                        <p className="text-sm text-[#e5e7eb]">{displayUser?.created_at ? new Date(displayUser.created_at).toLocaleDateString('ru') : '—'}</p>
                      </div>
                      <div>
                        <h3 className="text-[11px] font-bold tracking-wider text-white/40 uppercase mb-1">Пол</h3>
                        <p className="text-sm text-[#e5e7eb]">{displayUser?.gender || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <h3 className="text-[11px] font-bold tracking-wider text-white/40 uppercase mb-1">Род занятий</h3>
                        <p className="mt-1 text-sm text-[#e5e7eb] break-words break-all whitespace-pre-wrap">{displayUser?.occupation || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <h3 className="text-[11px] font-bold tracking-wider text-white/40 uppercase mb-1">Интересы</h3>
                        <p className="mt-1 text-sm text-[#e5e7eb] break-words break-all whitespace-pre-wrap">{displayUser?.interests || '—'}</p>
                      </div>
                    </div>
                    <div className="relative max-w-full">
                      <TrophyCarousel trophies={selectedUser ? selectedUserTrophies : profileTrophies} emptyMessage="Нет трофеев" bgGradientFrom="#222" />
                    </div>
                    <div className="bg-[var(--bg-profile-glass)] backdrop-blur-xl border border-white/5 rounded-2xl p-6 my-6">
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { icon: ThumbsUp, label: 'лайков', val: 0 },
                          { icon: MessageSquare, label: 'сообщений', val: selectedUser ? 0 : comments.length },
                          { icon: Trophy, label: 'трофеев', val: selectedUser ? selectedUserTrophies.length : profileTrophies.length },
                          { icon: Users, label: 'подписок', val: selectedUser ? selectedUserSubscriptions.length : subscriptions.length },
                          { icon: Users, label: 'подписчиков', val: selectedUser ? selectedUserFollowersCount : followersCount },
                        ].map((s, i) => (
                          <div key={i} className={`flex flex-col items-center justify-center py-3 px-2 border-r border-white/5 last:border-r-0 hover:bg-white/5 transition-all duration-300 rounded-lg`}>
                            <span className="text-2xl font-black text-[var(--color-accent)] drop-shadow-[0_0_8px_var(--color-accent)]">{s.val}</span>
                            <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-1">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-4 border-b border-[#333]">
                      {(selectedUser ? ['wall', 'posts', 'subscriptions'] : ['wall', 'posts', 'feed', 'messages', 'disputes', 'blocks', 'subscriptions']).map((t) => (
                        <button key={t} onClick={() => selectedUser ? setUserProfileTab(t) : setProfileTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${(selectedUser ? userProfileTab : profileTab) === t ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] shadow-[0_4px_12px_-2px_rgba(168,85,247,0.6)]' : 'text-[#888] hover:text-white'}`}>
                          {{ wall: 'Стена', posts: selectedUser ? 'Темы пользователя' : 'Собственные посты', feed: 'Лента', messages: 'Недавние сообщения', disputes: 'Споры', blocks: 'История блокировок', subscriptions: 'Подписки' }[t]}
                        </button>
                      ))}
                    </div>
                    {(selectedUser ? userProfileTab : profileTab) === 'wall' && (
                      <div>
                        {!selectedUser ? (
                        <form onSubmit={handlePostWall} className="flex gap-4 mb-6">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/5">
                            <AvatarWithFallback src={getAvatarUrl(user)} alt={user?.username} fallbackLetter={user?.username} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl focus-within:border-[var(--color-accent)]/50 transition-all">
                              <div className="pb-4">
                                <textarea
                                  ref={wallInputRef}
                                  value={postData.text}
                                  onChange={(e) => setPostData(prev => ({ ...prev, text: e.target.value }))}
                                  onInput={(e) => {
                                    const ta = e.target;
                                    ta.style.height = '44px';
                                    ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`;
                                  }}
                                  rows={1}
                                  className="w-full min-h-[44px] max-h-[300px] py-3 px-3 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-sm text-white placeholder:text-white/20 overflow-y-auto"
                                  placeholder="Напишите что-нибудь..."
                                />
                                {postData.images?.length > 0 && (
                                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2">
                                    {postData.images.filter(src => src && (typeof src === 'string' && src.startsWith('data:'))).map((src, i) => (
                                      <div key={i} className="relative flex-shrink-0">
                                        <img src={src} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                                        <button type="button" onClick={() => setPostData(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors shadow-lg" title="Удалить"><X size={12} /></button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {wallPollMode && (
                                  <div className="mt-4 p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-3">
                                    <input value={postData.poll?.question || ''} onChange={(e) => setPostData(prev => ({ ...prev, poll: { ...(prev.poll || {}), question: e.target.value } }))} className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)]/50" placeholder="Вопрос голосования" />
                                    {(postData.poll?.options || ['', '']).map((opt, i) => (
                                      <div key={i} className="flex gap-2">
                                        <input value={opt} onChange={(e) => setPostData(prev => ({ ...prev, poll: { ...(prev.poll || {}), options: (prev.poll?.options || ['', '']).map((o, j) => j === i ? e.target.value : o) } }))} className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none" placeholder={`Вариант ${i + 1}`} />
                                        <button type="button" onClick={() => setPostData(prev => ({ ...prev, poll: { ...(prev.poll || {}), options: (prev.poll?.options || ['', '']).filter((_, j) => j !== i) } }))} className="p-2 text-red-400 hover:bg-red-500/10 rounded" disabled={(postData.poll?.options || []).length <= 2}><X size={14} /></button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => setPostData(prev => ({ ...prev, poll: { ...(prev.poll || {}), options: [...(prev.poll?.options || ['', '']), ''] } }))} className="text-xs text-[var(--color-accent)] hover:underline">+ Добавить вариант</button>
                                  </div>
                                )}
                              </div>
                              <footer className="flex justify-between items-center w-full mt-4 pt-2 border-t border-white/5 shrink-0">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button type="button" onClick={() => wallImageInputRef.current?.click()} className="bg-white/5 p-2 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-all duration-300 cursor-pointer flex-shrink-0" title="Изображение"><Image size={14} /></button>
                                  <div className="relative flex-shrink-0" ref={wallEmojiPickerRef}>
                                    <button type="button" onClick={() => setWallEmojiPickerOpen(v => !v)} className="bg-white/5 p-2 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-all duration-300 cursor-pointer" title="Эмодзи"><Smile size={14} /></button>
                                    {wallEmojiPickerOpen && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setWallEmojiPickerOpen(false)} aria-hidden />
                                        <div className="absolute bottom-full left-0 mb-1 w-[600px] max-w-[min(42rem,calc(100vw-2rem))] p-5 bg-[var(--bg-block)] border border-white/10 rounded-xl shadow-xl z-50 grid grid-cols-12 gap-3 max-h-64 overflow-y-auto">
                                          {['😀','😊','😂','👍','❤️','😍','🤔','😎','🎉','😅','🔥','✨','👏','🙏','💪','😢','🤗','😇','🥳','😤'].map((emo, i) => (
                                            <button key={i} type="button" onClick={() => {
                                              const ta = wallInputRef.current;
                                              if (ta) {
                                                const start = ta.selectionStart, end = ta.selectionEnd;
                                                setPostData(prev => ({ ...prev, text: prev.text.slice(0, start) + emo + prev.text.slice(end) }));
                                                setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emo.length; ta.focus(); }, 0);
                                              }
                                              setWallEmojiPickerOpen(false);
                                            }} className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded transition-colors">{emo}</button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {!selectedUser && (
                                    <button type="button" onClick={() => setWallPollMode(v => !v)} className={`bg-white/5 p-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-xs transition-all duration-300 cursor-pointer flex-shrink-0 ${wallPollMode ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-white/70 hover:text-white'}`} title="Добавить голосование"><List size={14} /> <span>Голосование</span></button>
                                  )}
                                </div>
                                <button type="submit" disabled={!postData.text.trim() && !(postData.images?.length) && !(postData.poll?.question?.trim() && (postData.poll?.options || []).filter(Boolean).length >= 2)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors shrink-0 ml-4 disabled:opacity-50 disabled:cursor-not-allowed"><Send size={14} /> Опубликовать</button>
                              </footer>
                            </div>
                          </div>
                          <input ref={wallImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                            const files = [...(e.target.files || [])];
                            const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                            if (files.length !== valid.length) setToast({ message: 'Фото до 5 МБ каждое', type: 'error' });
                            if (valid.length === 0) return;
                            Promise.all(valid.map(f => new Promise((res) => {
                              const r = new FileReader();
                              r.onload = () => res(r.result);
                              r.readAsDataURL(f);
                            }))).then(urls => setPostData(prev => ({ ...prev, images: [...(prev.images || []), ...urls].slice(0, 10) })));
                            e.target.value = '';
                          }} />
                        </form>
                        ) : user && selectedUser.id !== user.id && (
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const content = wallInputOther.trim();
                          if (!content && wallImagesOther.length === 0) return;
                          try {
                            const post = await api.postWall(selectedUser.id, content || '', null, null, wallImagesOther);
                            setWallPosts(prev => [post, ...prev]);
                            setWallInputOther('');
                            setWallImagesOther([]);
                            const ta = wallContentRefOther.current;
                            if (ta) { ta.style.height = '44px'; }
                            setToast({ message: 'Опубликовано на стене', type: 'success' });
                          } catch (err) {
                            setToast({ message: err?.message || 'Ошибка', type: 'error' });
                          }
                        }} className="flex gap-4 mb-6">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/5">
                            <AvatarWithFallback src={getAvatarUrl(user)} alt={user?.username} fallbackLetter={user?.username} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl focus-within:border-[var(--color-accent)]/50 transition-all">
                              <div className="pb-4">
                                <textarea
                                  ref={wallContentRefOther}
                                  name="wallContent"
                                  value={wallInputOther}
                                  onChange={(e) => {
                                    setWallInputOther(e.target.value);
                                    const ta = e.target;
                                    ta.style.height = '44px';
                                    ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`;
                                  }}
                                  onInput={(e) => {
                                    const ta = e.target;
                                    ta.style.height = '44px';
                                    ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`;
                                  }}
                                  rows={1}
                                  className="w-full min-h-[44px] max-h-[300px] py-3 px-3 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-sm text-white placeholder:text-white/20 overflow-y-auto"
                                  placeholder="Написать на стене..."
                                />
                                {wallImagesOther.length > 0 && (
                                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2">
                                    {wallImagesOther.filter(src => src && (typeof src === 'string' && src.startsWith('data:'))).map((src, i) => (
                                      <div key={i} className="relative flex-shrink-0">
                                        <img src={src} alt="" className="w-24 h-24 rounded-xl object-cover border border-white/10" />
                                        <button type="button" onClick={() => setWallImagesOther(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors shadow-lg" title="Удалить"><X size={12} /></button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <footer className="flex justify-between items-center w-full mt-4 pt-2 border-t border-white/5 shrink-0">
                                <div className="flex items-center gap-4">
                                  <button type="button" onClick={() => wallImageInputRefOther.current?.click()} className="bg-white/5 p-2 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-all duration-300 cursor-pointer" title="Изображение"><Image size={14} /></button>
                                  <div className="relative" ref={wallEmojiPickerRefOther}>
                                    <button type="button" onClick={() => setWallEmojiPickerOpenOther(v => !v)} className="bg-white/5 p-2 rounded-lg hover:bg-white/10 text-[#8b949e] hover:text-white transition-all duration-300 cursor-pointer" title="Эмодзи"><Smile size={14} /></button>
                                    {wallEmojiPickerOpenOther && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setWallEmojiPickerOpenOther(false)} aria-hidden />
                                        <div className="absolute bottom-full left-0 mb-1 w-[600px] max-w-[min(42rem,calc(100vw-2rem))] p-5 bg-[var(--bg-block)] border border-white/10 rounded-xl shadow-xl z-50 grid grid-cols-12 gap-3 max-h-64 overflow-y-auto">
                                          {['😀','😊','😂','👍','❤️','😍','🤔','😎','🎉','😅','🔥','✨','👏','🙏','💪','😢','🤗','😇','🥳','😤'].map((emo, i) => (
                                            <button key={i} type="button" onClick={() => {
                                              const ta = wallContentRefOther.current;
                                              if (ta) {
                                                const start = ta.selectionStart, end = ta.selectionEnd;
                                                setWallInputOther(prev => prev.slice(0, start) + emo + prev.slice(end));
                                                ta.focus();
                                                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + emo.length; });
                                              }
                                              setWallEmojiPickerOpenOther(false);
                                            }} className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded transition-colors">{emo}</button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <button type="submit" disabled={!wallInputOther.trim() && wallImagesOther.length === 0} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors shrink-0 ml-4 disabled:opacity-50 disabled:cursor-not-allowed"><Send size={14} /> Опубликовать</button>
                              </footer>
                            </div>
                          </div>
                          <input ref={wallImageInputRefOther} type="file" accept="image/*" multiple className="hidden" onChange={(ev) => {
                            const files = [...(ev.target.files || [])];
                            const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                            if (files.length !== valid.length) setToast({ message: 'Фото до 5 МБ каждое', type: 'error' });
                            if (valid.length === 0) return;
                            Promise.all(valid.map(f => new Promise((res) => {
                              const r = new FileReader();
                              r.onload = () => res(r.result);
                              r.readAsDataURL(f);
                            }))).then(urls => setWallImagesOther(prev => [...prev, ...urls].slice(0, 10)));
                            ev.target.value = '';
                          }} />
                        </form>
                        )}
                        <div className="flex items-center gap-2 mb-4">
                          <button className="text-[11px] text-[#888] px-2 py-1 rounded hover:bg-[#2a2a2a]">Найти сообщения</button>
                          <ChevronDown size={12} />
                          <button className="text-[11px] text-[#888] px-2 py-1 rounded hover:bg-[#2a2a2a]">Сортировать</button>
                          <ChevronDown size={12} />
                        </div>
                        {wallPosts.length === 0 ? (
                          <div className="py-16 text-center bg-[#181818]/50 rounded-xl border border-[#333] border-dashed">
                            <p className="text-[#888] text-sm">На стене пока нет ни одного сообщения</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {wallPosts.map(w => {
                              const isProfileOwner = (w.author_id === profileUserId) || (w.user_id === profileUserId && w.author_id === w.user_id);
                              const avatarSrc = isProfileOwner ? getWallAvatarUrl(selectedUser || user) : (w.author_avatar && !isPlaceholderUrl(w.author_avatar) ? w.author_avatar : null);
                              const rawImgList = w.image ? [w.image] : (Array.isArray(w.images) ? w.images : (w.attachments?.[0] ? [w.attachments[0]] : []));
                              const images = rawImgList.filter(src => src && typeof src === 'string' && !src.includes('unsplash') && !src.includes('placeholder') && !src.includes('yandex') && !src.includes('dicebear') && (src.startsWith('data:') || src.startsWith('http')));
                              const pollOpts = w.poll_options_with_votes || (Array.isArray(w.poll_options) ? w.poll_options.map(t => ({ text: t, votes: 0 })) : []);
                              const hasPoll = w.poll_question?.trim() && pollOpts.filter(o => (o.text || o).trim()).length >= 2;
                              const totalVotes = pollOpts.reduce((s, o) => s + (o.votes || 0), 0);
                              const pollUserVote = w.poll_user_vote;
                              const comments = w.comments || [];
                              const commentsExpanded = wallCommentsOpenPostId === w.id;
                              const commentDraft = wallCommentDrafts[w.id] ?? '';
                              return (
                              <div key={w.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-6 shadow-2xl">
                                <div className="p-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/5">
                                      <AvatarWithFallback src={avatarSrc} alt={w.username} fallbackLetter={w.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-bold text-white">{w.username}</span>
                                      <span className="text-[11px] text-white/50 ml-2">{w.time}</span>
                                    </div>
                                  </div>
                                  {(w.content || '').trim() && <p className="text-sm text-white/90 whitespace-pre-wrap break-words mb-4">{w.content}</p>}
                                  {images.map((src, i) => (
                                    <div key={i} className="rounded-2xl overflow-hidden border border-white/5 shadow-inner mt-4">
                                      <img src={src} className="w-full h-auto max-h-[500px] object-cover" alt="Post content" />
                                    </div>
                                  ))}
                                  {hasPoll && (
                                    <div className="mt-4 space-y-2">
                                      <p className="text-sm font-medium text-white mb-3">{w.poll_question}</p>
                                      {pollOpts.filter(o => (o.text || o).trim()).map((opt, i) => {
                                        const text = typeof opt === 'string' ? opt : opt.text;
                                        const votes = typeof opt === 'object' ? (opt.votes || 0) : 0;
                                        const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                                        const isVoted = pollUserVote === i;
                                        return (
                                          <button key={i} type="button" onClick={() => handleVoteWallPoll(w.id, i)} className={`w-full flex justify-between items-start gap-4 px-4 py-3 rounded-xl relative overflow-hidden transition-all duration-500 cursor-pointer hover:bg-white/10 min-h-[48px] ${isVoted ? 'border border-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]/30' : 'border border-transparent'}`}>
                                            <div className="absolute inset-0 bg-[var(--color-accent)]/20 transition-all duration-500" style={{ width: `${pct}%` }} />
                                            <span className="relative z-10 text-sm text-white break-all whitespace-normal flex-1 min-w-0 text-left">{text}</span>
                                            <span className="relative z-10 flex-shrink-0 font-mono text-[11px] opacity-60">{totalVotes > 0 ? `${Math.round(pct)}%` : ''}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {commentsExpanded && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                      <div className="space-y-3 mb-4">
                                        {comments.map((c) => {
                                          const avatarSrc = (c.author_avatar || c.author?.custom_avatar || c.author?.avatar) && !isPlaceholderUrl(c.author_avatar || c.author?.custom_avatar || c.author?.avatar) ? (c.author_avatar || c.author?.custom_avatar || c.author?.avatar) : null;
                                          return (
                                          <div key={c.id} className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                                              <AvatarWithFallback src={avatarSrc} alt={c.username} fallbackLetter={c.username} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <span className="text-xs font-medium text-white">{c.username}</span>
                                              <span className="text-[10px] text-white/50 ml-2">{c.time}</span>
                                              <p className="text-sm text-white/80 break-words whitespace-normal mt-0.5">{c.content}</p>
                                            </div>
                                          </div>
                                          );
                                        })}
                                      </div>
                                      {user && (
                                        <form onSubmit={(e) => { e.preventDefault(); handleWallCommentSubmit(w.id, commentDraft); }} className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-3 mt-4">
                                          <div className="flex gap-3 items-center">
                                            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/30">
                                              <AvatarWithFallback src={getWallAvatarUrl(user)} alt="" fallbackLetter={user?.username} className="w-full h-full object-cover" />
                                            </div>
                                            <input value={commentDraft} onChange={(e) => setWallCommentDrafts(prev => ({ ...prev, [w.id]: e.target.value }))} placeholder="Написать комментарий..." className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-white placeholder:text-white/40" />
                                            <button type="submit" disabled={!commentDraft.trim()} className="px-3 py-1.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-lg text-xs font-medium hover:bg-[var(--color-accent)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">Отправить</button>
                                          </div>
                                        </form>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-white/50">
                                    <button type="button" onClick={() => handleLikeWallPost(w.id)} className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors">
                                      <Heart size={14} className={w.liked ? 'fill-current text-[var(--color-accent)]' : ''} />
                                      {w.likes ?? 0}
                                    </button>
                                    <button type="button" onClick={() => setWallCommentsOpenPostId(prev => prev === w.id ? null : w.id)} className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors">
                                      <MessageCircle size={14} />
                                      {comments.length}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );})}
                          </div>
                        )}
                      </div>
                    )}
                    {(selectedUser ? userProfileTab : profileTab) === 'posts' && (
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                          <MessageSquare size={14} className="text-[var(--color-accent)]" /> {selectedUser ? 'Темы пользователя' : 'Мои темы'}
                        </h4>
                        {(selectedUser ? selectedUserPosts : userPosts).length === 0 ? (
                          <div className="py-12 text-center"><p className="text-[#888] text-sm">Нет созданных тем</p>{!selectedUser && <button onClick={() => setView('editor')} className="mt-2 text-[var(--color-accent)] text-sm hover:underline">Создать</button>}</div>
                        ) : (
                          <div className="space-y-3">
                            {(selectedUser ? selectedUserPosts : userPosts).map(p => (
                              <div key={p.id} onClick={() => openThread(p)} className="p-5 bg-[#181818]/50 rounded-xl border border-[#333] hover:border-[var(--color-accent)]/30 cursor-pointer">
                                <div className="font-medium text-white group-hover:text-[var(--color-accent)] break-all">{p.title}</div>
                                <div className="text-[11px] text-[#888] mt-1">{p.category} • {p.replies} ответов • {p.time}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {!selectedUser && profileTab === 'feed' && (
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Лента активности</h4>
                        {activityFeed.length === 0 ? (
                          <div className="py-12 text-center bg-[#181818]/50 rounded-xl border border-[#333] border-dashed">
                            <p className="text-[#888] text-sm">Подпишитесь на пользователей, чтобы видеть их активность здесь</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activityFeed.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => item.post_id && openThread({ id: item.post_id })}
                                className={`flex items-center gap-4 p-5 bg-[#181818]/50 rounded-xl border border-[#333] ${item.post_id ? 'hover:border-[var(--color-accent)]/30 cursor-pointer transition-colors' : ''}`}
                              >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                  <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-[#ccc]">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); item.user_id && openUserProfile(item.user_id); }} className="font-bold text-white hover:text-[var(--color-accent)]">
                                      {item.username}
                                    </button>
                                    {' '}{item.text}
                                    <span className="text-[#666]"> ({item.time})</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {!selectedUser && profileTab === 'messages' && <div className="py-12 text-center text-[#888] text-sm">Нет сообщений</div>}
                    {!selectedUser && profileTab === 'disputes' && <div className="py-12 text-center text-[#888] text-sm">Нет споров</div>}
                    {!selectedUser && profileTab === 'blocks' && <div className="py-12 text-center text-[#888] text-sm">История блокировок пуста</div>}
                    {(selectedUser ? userProfileTab : profileTab) === 'subscriptions' && (
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Users size={14} className="text-[var(--color-accent)]" /> Подписки
                        </h4>
                        {(selectedUser ? selectedUserSubscriptions : subscriptions).length === 0 ? (
                          <div className="py-16 text-center bg-[#181818]/50 rounded-xl border border-[#333] border-dashed">
                            <p className="text-[#888] text-sm">Нет подписок</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(selectedUser ? selectedUserSubscriptions : subscriptions).map(s => (
                              <div key={s.id} className="p-6 bg-[#181818]/50 rounded-xl border border-[#333] hover:border-[var(--color-accent)]/30 transition-all flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--color-accent)]/30 mb-3">
                                  <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-base font-bold text-white mb-1">{s.username}</span>
                                <span className={`text-xs mb-4 ${getRankColor(s.rank)}`}>{s.rank || 'Юзер'}</span>
                                <button type="button" onClick={() => openUserProfile(s.id)} className="px-4 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 transition-colors">
                                  Посетить профиль
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </main>
                </div>
              </div>
              </>
              )}
            </div>
          )}
        </section>

        <aside className={`hidden space-y-6 ${view === 'profile' || view === 'admin' || view === 'messages' ? 'lg:hidden' : 'lg:block'}`}>
          <div className="bg-[var(--bg-widget-glass)] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <h4 className="text-[11px] font-bold tracking-[0.2em] opacity-60 uppercase">СТАТИСТИКА</h4>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center py-3">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[var(--color-accent)] drop-shadow-[0_0_10px_var(--color-accent)]">{stats.display_users ?? stats.users ?? 0}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-1 flex items-center gap-1"><Users size={14} className="text-[var(--color-accent)] opacity-50" /> пользователей</span>
              </div>
              <div className="flex flex-col items-center justify-center py-3">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[var(--color-accent)] drop-shadow-[0_0_10px_var(--color-accent)]">{stats.display_messages ?? 0}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-1 flex items-center gap-1"><MessageSquare size={14} className="text-[var(--color-accent)] opacity-50" /> сообщений</span>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg-widget-glass)] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <h4 className="text-[11px] font-bold tracking-[0.2em] opacity-60 uppercase">ПОСЛЕДНИЕ ОТВЕТЫ</h4>
            </div>
            <div className="p-3 space-y-1 max-h-[280px] overflow-y-auto scrollbar-comments">
              {latestComments.length === 0 ? (
                <p className="text-[11px] text-gray-500 py-4 text-center">Пока нет комментариев</p>
              ) : (
                latestComments.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => c.post_id && openThread({ id: c.post_id })}
                    className="w-full flex items-start gap-2 p-3 rounded-lg hover:bg-white/5 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                      <img src={c.author_avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{c.author}</span>
                      <span className="text-[11px] text-gray-400 line-clamp-2 break-words block">{String(c.content || '').replace(/<[^>]+>/g, '').slice(0, 120)}{(c.content || '').length > 120 ? '…' : ''}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showProfileEdit && user && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowProfileEdit(false)}
          onSave={() => { loadUser(); setToast({ message: 'Профиль обновлён', type: 'success' }); }}
        />
      )}

      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuth(false)}></div>
          <div className="relative bg-[var(--bg-block)] border border-[#30363d] w-full max-w-sm rounded-2xl p-8 shadow-2xl">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-[#484f58] hover:text-white transition-colors"><X size={20} /></button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[var(--color-accent)] mx-auto rounded-xl flex items-center justify-center text-black font-black text-2xl mb-4 shadow-xl shadow-[var(--color-accent)]/20">IT</div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{authMode === 'login' ? 'АВТОРИЗАЦИЯ' : 'РЕГИСТРАЦИЯ'}</h2>
              <p className="text-[10px] text-[#484f58] font-black mt-2 uppercase tracking-widest">{siteSettings.site_name || 'FORUM.LIVE'} • DEVELOPERS</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {authError && <div className="text-red-400 text-sm text-center">{authError}</div>}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider">{authMode === 'login' ? 'Никнейм или Email' : 'Никнейм'}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-[#484f58]" size={16} />
                  <input name="login" required className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-3.5 pl-10 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all text-white" placeholder={authMode === 'login' ? 'admin_dev' : 'my_username'} />
                </div>
              </div>
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <input name="email" type="email" required className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-3.5 pl-10 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all text-white" placeholder="email@example.com" />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#484f58] uppercase tracking-wider">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-[#484f58]" size={16} />
                  <input name="password" type="password" required minLength={4} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-3.5 pl-10 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all text-white" placeholder="••••••••" />
                </div>
              </div>

              <button disabled={authLoading} type="submit" className="w-full bg-[var(--color-accent)] py-4 rounded-lg font-black text-black hover:bg-[color:var(--color-accent)]/90 transition-all shadow-lg shadow-[var(--color-accent)]/20 transform active:scale-95 uppercase tracking-widest text-xs mt-4 disabled:opacity-50">
                {authLoading ? '...' : authMode === 'login' ? 'ВОЙТИ В АККАУНТ' : 'СОЗДАТЬ АККАУНТ'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-[11px] font-bold text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors uppercase tracking-wider">
                {authMode === 'login' ? 'Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full bg-[var(--bg-main)]/95 backdrop-blur-md border-t border-[#30363d] h-16 flex md:hidden items-center justify-around z-50 px-6">
        <button onClick={() => { setView('feed'); setActiveNav('forum'); }} className={`flex flex-col items-center gap-1 ${view === 'feed' && activeNav === 'forum' ? 'text-[var(--color-accent)]' : 'text-[#8b949e]'}`}>
          <MessageSquare size={20} />
          <span className="text-[9px] font-black uppercase">Форум</span>
        </button>
        <button
          onClick={() => { setView('messages'); setActiveChatUser(null); setChatHistory([]); }}
          className={`flex flex-col items-center gap-1 ${view === 'messages' ? '' : 'text-[#8b949e]'}`}
          style={view === 'messages' ? { color: messagesConfig.color || 'var(--color-accent)' } : {}}
        >
          {React.createElement(getIconComponent(messagesConfig?.icon || 'MessageCircle'), { size: 20 })}
          <span className="text-[9px] font-black uppercase">{messagesConfig.name}</span>
        </button>
        <button onClick={() => user ? setView('editor') : (setShowAuth(true), setAuthMode('login'))} className="bg-[var(--color-accent)] text-black p-3 rounded-xl -mt-10 shadow-xl border-4 border-[#0d1117] transition-all active:scale-90">
          <PlusIcon size={24} />
        </button>
        <button onClick={() => { setSelectedUser(null); setView('profile'); }} className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-[var(--color-accent)]' : 'text-[#8b949e]'}`}>
          <User size={20} />
          <span className="text-[9px] font-black uppercase">Профиль</span>
        </button>
      </footer>
      </div>
    </div>
  );
}
