export const theme = {
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

export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Все темы', icon: 'MessageSquare', color: '#10b981' },
  { id: 'dev', name: 'Разработка', icon: 'Code', color: '#10b981' },
  { id: 'sec', name: 'Безопасность', icon: 'Shield', color: '#10b981' },
  { id: 'sys', name: 'Администрирование', icon: 'Terminal', color: '#10b981' },
  { id: 'career', name: 'Карьера', icon: 'Briefcase', color: '#10b981' },
];

export const TOP_NAV = [
  { id: 'forum', name: 'Форум' },
  { id: 'articles', name: 'Статьи' },
  { id: 'rules', name: 'Правила' },
];

export const DIRECT_POST_CATEGORIES = ['Backend', 'Frontend', 'DevOps', 'Languages', 'Security', 'Career', 'Articles'];
