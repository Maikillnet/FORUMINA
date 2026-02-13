import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultData = { users: [], categories: [], posts: [], comments: [], post_votes: [], messages: [], private_messages: [], wall_posts: [], wall_poll_votes: [], wall_post_likes: [], wall_post_comments: [], subscriptions: [], comment_likes: [], post_likes: [], trophies: [], user_trophies: [], activity_log: [], system_settings: [] };

let _db;

export async function initDb() {
  if (_db) return _db;
  _db = await JSONFilePreset(join(__dirname, 'forum.json'), defaultData);
  await _db.read();
  if (!_db.data.wall_posts) _db.data.wall_posts = [];
  if (!_db.data.wall_poll_votes) _db.data.wall_poll_votes = [];
  if (!_db.data.wall_post_likes) _db.data.wall_post_likes = [];
  if (!_db.data.wall_post_comments) _db.data.wall_post_comments = [];
  if (!_db.data.subscriptions) _db.data.subscriptions = [];
  if (!_db.data.comment_likes) _db.data.comment_likes = [];
  if (!_db.data.post_likes) _db.data.post_likes = [];
  if (!_db.data.trophies) _db.data.trophies = [];
  if (!_db.data.user_trophies) _db.data.user_trophies = [];
  if (!_db.data.activity_log) _db.data.activity_log = [];
  if (!_db.data.system_settings) _db.data.system_settings = [];
  if (!_db.data.private_messages) _db.data.private_messages = [];

  const settings = _db.data.system_settings;
  if (!settings.find((s) => s.key === 'reputation_per_thread')) {
    settings.push({ key: 'reputation_per_thread', value: '5', description: 'Репутация за создание новой темы' });
    await _db.write();
  }
  if (!settings.find((s) => s.key === 'site_name')) {
    settings.push({ key: 'site_name', value: 'FORUM.LIVE', description: 'Название форума' });
    await _db.write();
  }
  if (!settings.find((s) => s.key === 'site_logo')) {
    settings.push({ key: 'site_logo', value: '', description: 'Логотип форума (base64 или URL)' });
    await _db.write();
  }
  const defaultTheme = JSON.stringify({ bg_main: '#0d1117', bg_block: '#161b22', text_primary: '#ffffff', color_accent: '#10b981' });
  if (!settings.find((s) => s.key === 'theme')) {
    settings.push({ key: 'theme', value: defaultTheme, description: 'Цветовая тема сайта' });
    await _db.write();
  }

  const adminUser = _db.data.users.find(u => u.id === 1 || u.username === 'admin_dev');
  if (adminUser && adminUser.is_admin === undefined) {
    adminUser.is_admin = true;
    await _db.write();
  }

  if (!_db.data.categories) _db.data.categories = [];
  const hasMessages = _db.data.categories.some((c) => c.id === 'messages');
  if (!hasMessages) {
    _db.data.categories.push({ id: 'messages', name: 'Сообщения', description: 'Личные сообщения', icon: 'MessageSquare', color: '#3b82f6' });
    await _db.write();
  }

  if (_db.data.users.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    _db.data.users.push({
      id: 1, username: 'admin_dev', email: 'admin@forum.live', password: hash,
      avatar_seed: 'Admin', rank: 'Легенда', rank_color: 'text-orange-400', reputation: 0,
      created_at: new Date().toISOString(), gender: '', occupation: '', interests: '',
      is_admin: true,
    });
    const posts = [
      { id: 1, title: 'Архитектура микросервисов на Go: лучшие практики 2024', content: 'Приветствую сообщество! В этой теме я хотел бы разобрать фундаментальные подходы к построению отказоустойчивых систем.\n\nОсновные тезисы:\n- Принципы SOLID в распределенных системах\n- Выбор протокола взаимодействия (gRPC vs REST)\n- Стратегии кэширования на уровне БД', category: 'Backend', author_id: 1, views: 0, votes: 124, is_pinned: 0, is_hot: 1, tags: 'go,backend,microservices', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, title: 'Почему мы перешли с React на Svelte и не пожалели', content: 'Расскажу о нашем опыте миграции с React на Svelte.', category: 'Frontend', author_id: 1, views: 0, votes: 89, is_pinned: 1, is_hot: 0, tags: 'react,svelte,frontend', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, title: 'Безопасность Kubernetes: как закрыть дыры в CI/CD', content: 'Давайте разберём основные вектор атаки в K8s.', category: 'DevOps', author_id: 1, views: 0, votes: 45, is_pinned: 0, is_hot: 0, tags: 'kubernetes,security', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 4, title: 'Обзор новых фич TypeScript 5.4', content: 'TypeScript 5.4 принёс несколько интересных улучшений.', category: 'Languages', author_id: 1, views: 0, votes: 12, is_pinned: 0, is_hot: 0, tags: 'typescript', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    _db.data.posts.push(...posts);
    _db.data.categories = [
      { id: 'all', name: 'Все темы' }, { id: 'messages', name: 'Сообщения', description: 'Личные сообщения', icon: 'MessageSquare', color: '#3b82f6' },
      { id: 'dev', name: 'Разработка' }, { id: 'sec', name: 'Безопасность' },
      { id: 'sys', name: 'Администрирование' }, { id: 'career', name: 'Карьера' },
      { id: 'Backend', name: 'Backend' }, { id: 'Frontend', name: 'Frontend' }, { id: 'DevOps', name: 'DevOps' },
      { id: 'Languages', name: 'Languages' }, { id: 'Security', name: 'Security' }, { id: 'Career', name: 'Карьера' },
    ];
    _db.data.messages = [
      { id: 1, user_id: 1, username: 'admin_dev', content: 'Добро пожаловать на форум!', created_at: new Date().toISOString() },
      { id: 2, user_id: 1, username: 'admin_dev', content: 'Задавайте вопросы и делитесь опытом.', created_at: new Date().toISOString() },
    ];
    await _db.write();
  }
  return _db;
}

function d() {
  if (!_db) throw new Error('DB not initialized. Call initDb() first.');
  return _db.data;
}

function save() {
  return _db.write();
}

function logActivity(type, userId, data = {}) {
  if (!d().activity_log) d().activity_log = [];
  const id = Math.max(0, ...d().activity_log.map((a) => a.id), 0) + 1;
  d().activity_log.push({ id, type, user_id: userId, ...data, created_at: new Date().toISOString() });
  save();
}

function addReputation(userId, delta) {
  const u = d().users.find((x) => x.id === userId);
  if (u) {
    u.reputation = (u.reputation || 0) + delta;
    save();
  }
}

const CAT_MAP = { dev: ['Backend', 'Frontend', 'Languages'], sec: ['Security'], sys: ['DevOps'], career: ['Career'] };
const DIRECT_CATS = ['Backend', 'Frontend', 'DevOps', 'Languages', 'Security', 'Career'];
const RANKS = [
  { id: 'Юзер', color: 'text-slate-400' },
  { id: 'Боец', color: 'text-blue-400' },
  { id: 'Хранитель', color: 'text-cyan-400' },
  { id: 'Модератор', color: 'text-purple-400' },
  { id: 'Поверенный', color: 'text-amber-400' },
  { id: 'Легенда', color: 'text-orange-400' },
];

export default {
  users: {
    getByLogin(login) {
      return d().users.find((x) => x.username === login || x.email === login) || null;
    },
    getById(id) {
      return d().users.find((x) => x.id === id) || null;
    },
    getByUsername(username) {
      return d().users.find((x) => x.username === username) || null;
    },
    getByEmail(email) {
      return d().users.find((x) => x.email === email) || null;
    },
    listAll() {
      return d().users.map((u) => {
        const { password: _, ...safe } = u;
        return safe;
      });
    },
    async create(username, email, password) {
      const id = Math.max(0, ...d().users.map((u) => u.id)) + 1;
      const now = new Date().toISOString();
      const user = { id, username: username.trim(), email: email.trim(), password, avatar_seed: 'user', rank: 'Юзер', rank_color: 'text-slate-400', reputation: 0, created_at: now, gender: '', occupation: '', interests: '', is_admin: false };
      d().users.push(user);
      await save();
      return user;
    },
    update(userId, data) {
      const u = d().users.find((x) => x.id === userId);
      if (!u) return null;
      if (data.username != null) {
        const trimmed = String(data.username).trim();
        if (trimmed.length < 2) return null;
        const existing = d().users.find((x) => x.id !== userId && x.username === trimmed);
        if (existing) return null;
        u.username = trimmed;
      }
      if ('avatar' in data) u.custom_avatar = data.avatar || null;
      if ('cover' in data) u.cover_url = data.cover || null;
      if (data.last_online != null) u.last_online = data.last_online;
      if (data.gender != null) u.gender = data.gender;
      if (data.occupation != null) u.occupation = data.occupation;
      if (data.interests != null) u.interests = data.interests;
      save();
      return u;
    },
    setRank(adminId, userId, rank) {
      const admin = d().users.find((x) => x.id === adminId);
      if (!admin?.is_admin) return null;
      const r = RANKS.find((x) => x.id === rank);
      if (!r) return null;
      const u = d().users.find((x) => x.id === userId);
      if (!u) return null;
      u.rank = r.id;
      u.rank_color = r.color;
      save();
      return u;
    },
    recalculateReputation() {
      const repPerThread = parseInt(d().system_settings?.find((s) => s.key === 'reputation_per_thread')?.value || '5', 10);
      const posts = d().posts || [];
      const comments = d().comments || [];
      const postLikes = d().post_likes || [];
      const commentLikes = d().comment_likes || [];
      let updated = 0;
      for (const u of d().users) {
        const threadCount = posts.filter((p) => p.author_id === u.id).length;
        const userPostIds = posts.filter((p) => p.author_id === u.id).map((p) => p.id);
        const userCommentIds = comments.filter((c) => c.author_id === u.id).map((c) => c.id);
        const likesOnPosts = postLikes.filter((pl) => userPostIds.includes(pl.post_id)).length;
        const likesOnComments = commentLikes.filter((cl) => userCommentIds.includes(cl.comment_id)).length;
        const totalLikesReceived = likesOnPosts + likesOnComments;
        const newReputation = (threadCount * repPerThread) + totalLikesReceived;
        u.reputation = newReputation;
        updated++;
      }
      save();
      return updated;
    },
  },
  wall_posts: {
    list(userId, limit = 50) {
      const list = (d().wall_posts || []).filter((w) => w.user_id === parseInt(userId));
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
    },
    create(userId, authorId, username, content, threadId = null, threadTitle = null, images = [], pollQuestion = null, pollOptions = null) {
      if (!d().wall_posts) d().wall_posts = [];
      const id = Math.max(0, ...d().wall_posts.map((w) => w.id), 0) + 1;
      const imagesArr = Array.isArray(images) ? images : (images ? [images] : []);
      const wall = { id, user_id: parseInt(userId), author_id: authorId, username, content, created_at: new Date().toISOString(), thread_id: threadId || null, thread_title: threadTitle || null, images: imagesArr, poll_question: pollQuestion || null, poll_options: Array.isArray(pollOptions) ? pollOptions : (pollOptions ? [pollOptions] : null) };
      d().wall_posts.push(wall);
      save();
      return wall;
    },
  },
  wall_poll_votes: {
    vote(wallPostId, userId, optionIndex) {
      if (!d().wall_poll_votes) d().wall_poll_votes = [];
      const existing = d().wall_poll_votes.find((v) => v.wall_post_id === parseInt(wallPostId) && v.user_id === userId);
      if (existing) {
        existing.option_index = optionIndex;
      } else {
        d().wall_poll_votes.push({ wall_post_id: parseInt(wallPostId), user_id: userId, option_index: optionIndex });
      }
      save();
    },
    getVotes(wallPostId) {
      return (d().wall_poll_votes || []).filter((v) => v.wall_post_id === parseInt(wallPostId));
    },
    getUserVote(wallPostId, userId) {
      const v = (d().wall_poll_votes || []).find((x) => x.wall_post_id === parseInt(wallPostId) && x.user_id === userId);
      return v ? v.option_index : null;
    },
  },
  wall_post_likes: {
    getCount(wallPostId) {
      return (d().wall_post_likes || []).filter((p) => p.wall_post_id === parseInt(wallPostId)).length;
    },
    hasLiked(userId, wallPostId) {
      return (d().wall_post_likes || []).some((p) => p.user_id === userId && p.wall_post_id === parseInt(wallPostId));
    },
    toggle(userId, wallPostId) {
      if (!d().wall_post_likes) d().wall_post_likes = [];
      const existing = d().wall_post_likes.find((p) => p.user_id === userId && p.wall_post_id === parseInt(wallPostId));
      if (existing) {
        d().wall_post_likes.splice(d().wall_post_likes.indexOf(existing), 1);
      } else {
        d().wall_post_likes.push({ user_id: userId, wall_post_id: parseInt(wallPostId) });
      }
      save();
      return d().wall_post_likes.filter((p) => p.wall_post_id === parseInt(wallPostId)).length;
    },
  },
  wall_post_comments: {
    list(wallPostId) {
      return (d().wall_post_comments || [])
        .filter((c) => c.wall_post_id === parseInt(wallPostId))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    },
    create(wallPostId, userId, username, content) {
      if (!d().wall_post_comments) d().wall_post_comments = [];
      const id = Math.max(0, ...d().wall_post_comments.map((c) => c.id), 0) + 1;
      const comment = { id, wall_post_id: parseInt(wallPostId), user_id: userId, username, content, created_at: new Date().toISOString() };
      d().wall_post_comments.push(comment);
      save();
      return comment;
    },
  },
  post_likes: {
    getCount(postId) {
      return (d().post_likes || []).filter((p) => p.post_id === parseInt(postId)).length;
    },
    hasLiked(userId, postId) {
      return (d().post_likes || []).some((p) => p.user_id === userId && p.post_id === parseInt(postId));
    },
    toggle(userId, postId) {
      if (!d().post_likes) d().post_likes = [];
      const existing = d().post_likes.find((p) => p.user_id === userId && p.post_id === parseInt(postId));
      if (existing) {
        d().post_likes.splice(d().post_likes.indexOf(existing), 1);
      } else {
        d().post_likes.push({ user_id: userId, post_id: parseInt(postId) });
      }
      save();
      return d().post_likes.filter((p) => p.post_id === parseInt(postId)).length;
    },
  },
  subscriptions: {
    list(userId) {
      const subs = (d().subscriptions || []).filter((s) => s.follower_id === parseInt(userId));
      return subs.map((s) => {
        const u = d().users.find((x) => x.id === s.user_id);
        return u ? { id: u.id, username: u.username, avatar: u.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.avatar_seed || u.username}`, rank: u.rank } : null;
      }).filter(Boolean);
    },
    followers(userId) {
      const subs = (d().subscriptions || []).filter((s) => s.user_id === parseInt(userId));
      return subs.map((s) => {
        const u = d().users.find((x) => x.id === s.follower_id);
        return u ? { id: u.id, username: u.username, avatar: u.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.avatar_seed || u.username}`, rank: u.rank } : null;
      }).filter(Boolean);
    },
    toggle(followerId, targetId) {
      const fid = parseInt(followerId);
      const tid = parseInt(targetId);
      if (fid === tid) return { followed: false, followersCount: 0 };
      const existing = (d().subscriptions || []).find((s) => s.follower_id === fid && s.user_id === tid);
      if (existing) {
        d().subscriptions = (d().subscriptions || []).filter((s) => s !== existing);
      } else {
        if (!d().subscriptions) d().subscriptions = [];
        d().subscriptions.push({ follower_id: fid, user_id: tid });
      }
      save();
      const followersCount = (d().subscriptions || []).filter((s) => s.user_id === tid).length;
      return { followed: !existing, followersCount };
    },
    isFollowing(followerId, targetId) {
      return (d().subscriptions || []).some((s) => s.follower_id === parseInt(followerId) && s.user_id === parseInt(targetId));
    },
  },
  categories: {
    all() {
      return d().categories || [];
    },
    getById(id) {
      return (d().categories || []).find((c) => c.id === id);
    },
    create(data) {
      if (!d().categories) d().categories = [];
      const { name, description = '', icon = 'Folder', color = '#10b981' } = data;
      const baseId = (name || '').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') || `cat_${Date.now()}`;
      let id = baseId;
      let n = 0;
      while (d().categories.some((c) => c.id === id)) id = `${baseId}_${++n}`;
      const cat = { id, name: (name || '').trim(), description: (description || '').trim(), icon: (icon || 'Folder').trim(), color: (color || '#10b981').trim() };
      d().categories.push(cat);
      save();
      return cat;
    },
    update(id, data) {
      const cat = (d().categories || []).find((c) => c.id === id);
      if (!cat) return null;
      if (data.name != null) cat.name = String(data.name).trim();
      if (data.description != null) cat.description = String(data.description).trim();
      if (data.icon != null) cat.icon = String(data.icon).trim() || 'Folder';
      if (data.color != null) cat.color = String(data.color).trim() || '#10b981';
      save();
      return cat;
    },
    delete(id) {
      const idx = (d().categories || []).findIndex((c) => c.id === id);
      if (idx < 0) return false;
      const postsUsing = (d().posts || []).filter((p) => p.category === id).length;
      if (postsUsing > 0) return null;
      d().categories.splice(idx, 1);
      save();
      return true;
    },
  },
  posts: {
    list(category, filter) {
      let posts = d().posts;
      if (category && category !== 'all') {
        if (CAT_MAP[category]) posts = posts.filter((p) => CAT_MAP[category].includes(p.category));
        else if (DIRECT_CATS.includes(category)) posts = posts.filter((p) => p.category === category);
      }
      posts = [...posts].sort((a, b) => {
        if (filter === 'hot') return (b.votes || 0) - (a.votes || 0);
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      return posts.map((p) => {
        const u = d().users.find((x) => x.id === p.author_id);
        const replies = (d().comments || []).filter((c) => c.post_id === p.id).length;
        const authorAvatar = u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`;
        return { ...p, author: u?.username, rank: u?.rank, rank_color: u?.rank_color, replies, author_avatar: authorAvatar };
      });
    },
    getById(id, currentUserId = null) {
      const p = d().posts.find((x) => x.id === parseInt(id));
      if (!p) return null;
      const u = d().users.find((x) => x.id === p.author_id);
      const authorAvatar = u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`;
      const likes_count = (d().post_likes || []).filter((pl) => pl.post_id === parseInt(id)).length;
      const liked = currentUserId ? (d().post_likes || []).some((pl) => pl.user_id === currentUserId && pl.post_id === parseInt(id)) : false;
      return { ...p, author: u?.username, rank: u?.rank, rank_color: u?.rank_color, author_avatar: authorAvatar, likes_count, liked };
    },
    create(title, content, category, author_id, tags = '', images = []) {
      const id = Math.max(0, ...d().posts.map((p) => p.id)) + 1;
      const now = new Date().toISOString();
      const imagesArr = Array.isArray(images) ? images : (images ? [images] : []);
      const post = { id, title, content, category, author_id, views: 0, votes: 0, is_pinned: 0, is_hot: 0, tags: (tags || '').trim(), images: imagesArr, created_at: now, updated_at: now };
      d().posts.push(post);
      const repPerThread = parseInt(d().system_settings?.find((s) => s.key === 'reputation_per_thread')?.value || '5', 10);
      if (repPerThread > 0) addReputation(author_id, repPerThread);
      save();
      logActivity('thread', author_id, { post_id: id, title });
      return post;
    },
    getByAuthorId(authorId, limit = 10) {
      return d().posts
        .filter((p) => p.author_id === parseInt(authorId))
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, limit)
        .map((p) => {
          const u = d().users.find((x) => x.id === p.author_id);
          const replies = (d().comments || []).filter((c) => c.post_id === p.id).length;
          return { ...p, author: u?.username, rank: u?.rank, rank_color: u?.rank_color, replies };
        });
    },
    incrementViews(id) {
      const p = d().posts.find((x) => x.id === parseInt(id));
      if (p) p.views = (p.views || 0) + 1;
      save();
    },
    getRepliesCount(id) {
      return (d().comments || []).filter((c) => c.post_id === parseInt(id)).length;
    },
    getVotes(id) {
      const p = d().posts.find((x) => x.id === parseInt(id));
      return p ? p.votes || 0 : 0;
    },
    vote(userId, postId, vote) {
      const pvs = d().post_votes || [];
      const existing = pvs.find((x) => x.user_id === userId && x.post_id === parseInt(postId));
      const post = d().posts.find((p) => p.id === parseInt(postId));
      if (!post) return 0;

      if (existing) {
        if (existing.vote === vote) {
          pvs.splice(pvs.indexOf(existing), 1);
          post.votes = (post.votes || 0) - vote;
          if (existing.vote === 1) addReputation(post.author_id, -5);
        } else {
          if (existing.vote === 1) addReputation(post.author_id, -5);
          if (vote === 1) addReputation(post.author_id, 5);
          post.votes = (post.votes || 0) - existing.vote + vote;
          existing.vote = vote;
        }
      } else {
        pvs.push({ user_id: userId, post_id: parseInt(postId), vote });
        post.votes = (post.votes || 0) + vote;
        if (vote === 1) addReputation(post.author_id, 5);
      }
      if (!d().post_votes) d().post_votes = pvs;
      save();
      return post.votes;
    },
    delete(id) {
      const pid = parseInt(id);
      const idx = (d().posts || []).findIndex((p) => p.id === pid);
      if (idx < 0) return false;
      d().posts.splice(idx, 1);
      if (d().comments) d().comments = (d().comments || []).filter((c) => c.post_id !== pid);
      if (d().post_votes) d().post_votes = (d().post_votes || []).filter((v) => v.post_id !== pid);
      if (d().post_likes) d().post_likes = (d().post_likes || []).filter((l) => l.post_id !== pid);
      save();
      return true;
    },
  },
  comments: {
    getTotalCount() {
      return (d().comments || []).length;
    },
    getCountByAuthor(authorId) {
      return (d().comments || []).filter((c) => c.author_id === authorId).length;
    },
    getLatest(limit = 5) {
      const comments = (d().comments || [])
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
      const posts = d().posts || [];
      return comments.map((c) => {
        const u = d().users.find((x) => x.id === c.author_id);
        const post = posts.find((p) => p.id === c.post_id);
        const authorAvatar = u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`;
        return { id: c.id, post_id: c.post_id, post_title: post?.title, author: u?.username, author_avatar: authorAvatar, content: c.content, created_at: c.created_at };
      });
    },
    list(postId) {
      return (d().comments || [])
        .filter((c) => c.post_id === parseInt(postId))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((c) => {
          const u = d().users.find((x) => x.id === c.author_id);
          const authorAvatar = u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`;
          const images = Array.isArray(c.images) ? c.images : (c.image ? [c.image] : []);
          const { image: _, ...rest } = c;
          return { ...rest, images, parent_id: c.parent_id ?? null, author: u?.username, avatar_seed: u?.avatar_seed, author_avatar: authorAvatar, rank: u?.rank, rank_color: u?.rank_color };
        });
    },
    create(postId, authorId, content, images = [], parentId = null) {
      const id = Math.max(0, ...(d().comments || []).map((c) => c.id), 0) + 1;
      if (!d().comments) d().comments = [];
      const post = d().posts.find((p) => p.id === parseInt(postId));
      if (post && post.author_id !== authorId) addReputation(post.author_id, 1);
      const imagesArr = Array.isArray(images) ? images : (images?.length ? images : []);
      const comment = { id, post_id: parseInt(postId), author_id: authorId, content, images: imagesArr, parent_id: parentId || null, created_at: new Date().toISOString() };
      d().comments.push(comment);
      if (post) post.updated_at = new Date().toISOString();
      save();
      logActivity('reply', authorId, { post_id: parseInt(postId), post_title: post?.title });
      const u = d().users.find((x) => x.id === authorId);
      return { ...comment, author: u?.username, avatar_seed: u?.avatar_seed };
    },
  },
  comment_likes: {
    getCount(commentId) {
      return (d().comment_likes || []).filter((c) => c.comment_id === parseInt(commentId)).length;
    },
    hasLiked(userId, commentId) {
      return (d().comment_likes || []).some((c) => c.user_id === userId && c.comment_id === parseInt(commentId));
    },
    toggle(userId, commentId) {
      if (!d().comment_likes) d().comment_likes = [];
      const existing = d().comment_likes.find((c) => c.user_id === userId && c.comment_id === parseInt(commentId));
      if (existing) {
        d().comment_likes.splice(d().comment_likes.indexOf(existing), 1);
      } else {
        d().comment_likes.push({ user_id: userId, comment_id: parseInt(commentId) });
      }
      save();
      return d().comment_likes.filter((c) => c.comment_id === parseInt(commentId)).length;
    },
  },
  search: {
    byTitleOrContent(q) {
      const lower = q.toLowerCase();
      return d().posts
        .filter((p) => (p.title || '').toLowerCase().includes(lower) || (p.content || '').toLowerCase().includes(lower))
        .slice(0, 10)
        .map((p) => {
          const u = d().users.find((x) => x.id === p.author_id);
          return { id: p.id, title: p.title, author: u?.username, category: p.category };
        });
    },
  },
  messages: {
    list(limit = 50) {
      if (!d().messages) d().messages = [];
      return d().messages
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .reverse();
    },
    create(userId, username, content) {
      if (!d().messages) d().messages = [];
      const id = Math.max(0, ...d().messages.map((m) => m.id), 0) + 1;
      const msg = { id, user_id: userId, username, content, created_at: new Date().toISOString() };
      d().messages.push(msg);
      save();
      return msg;
    },
  },
  private_messages: {
    create(senderId, receiverId, content) {
      if (!d().private_messages) d().private_messages = [];
      const id = Math.max(0, ...d().private_messages.map((m) => m.id), 0) + 1;
      const msg = { id, senderId, receiverId, content, timestamp: new Date().toISOString(), read: false };
      d().private_messages.push(msg);
      save();
      return msg;
    },
    getConversation(userId, contactId) {
      const list = (d().private_messages || []).filter(
        (m) => (m.senderId === userId && m.receiverId === contactId) || (m.senderId === contactId && m.receiverId === userId)
      );
      return list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },
    getConversations(userId) {
      const list = d().private_messages || [];
      const seen = new Set();
      const convos = [];
      for (const m of list) {
        const other = m.senderId === userId ? m.receiverId : m.senderId;
        if (other === userId) continue;
        const key = [userId, other].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);
        const msgs = list.filter((x) => (x.senderId === userId && x.receiverId === other) || (x.senderId === other && x.receiverId === userId));
        const last = msgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        convos.push({ contactId: other, lastMessage: last?.content || '', lastTime: last?.timestamp || '' });
      }
      convos.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
      return convos;
    },
  },
  stats: {
    get() {
      return { posts: d().posts.length, users: d().users.length };
    },
  },
  trophies: {
    list() {
      return d().trophies || [];
    },
    getById(id) {
      return (d().trophies || []).find((t) => t.id === parseInt(id)) || null;
    },
    create(name, description, image_url) {
      const id = Math.max(0, ...(d().trophies || []).map((t) => t.id), 0) + 1;
      const trophy = { id, name: (name || '').trim(), description: (description || '').trim(), image_url: image_url || null, created_at: new Date().toISOString() };
      if (!d().trophies) d().trophies = [];
      d().trophies.push(trophy);
      save();
      return trophy;
    },
    delete(id) {
      const tid = parseInt(id);
      const idx = (d().trophies || []).findIndex((t) => t.id === tid);
      if (idx < 0) return false;
      d().trophies.splice(idx, 1);
      d().user_trophies = (d().user_trophies || []).filter((ut) => ut.trophy_id !== tid);
      save();
      return true;
    },
  },
  user_trophies: {
    getByUserId(userId) {
      const uId = parseInt(userId);
      const uts = (d().user_trophies || []).filter((ut) => ut.user_id === uId);
      return uts.map((ut) => {
        const trophy = (d().trophies || []).find((t) => t.id === ut.trophy_id);
        return trophy ? { ...trophy, awarded_at: ut.awarded_at } : null;
      }).filter(Boolean);
    },
    assign(userId, trophyId, adminId) {
      const admin = d().users.find((x) => x.id === adminId);
      if (!admin?.is_admin) return null;
      const trophy = (d().trophies || []).find((t) => t.id === parseInt(trophyId));
      if (!trophy) return null;
      const u = d().users.find((x) => x.id === parseInt(userId));
      if (!u) return null;
      const existing = (d().user_trophies || []).find((ut) => ut.user_id === u.id && ut.trophy_id === trophy.id);
      if (existing) return trophy;
      if (!d().user_trophies) d().user_trophies = [];
      d().user_trophies.push({ user_id: u.id, trophy_id: trophy.id, awarded_at: new Date().toISOString(), admin_id: adminId });
      save();
      logActivity('trophy', u.id, { trophy_id: trophy.id, trophy_name: trophy.name });
      return trophy;
    },
    revoke(userId, trophyId, adminId) {
      const admin = d().users.find((x) => x.id === adminId);
      if (!admin?.is_admin) return false;
      const idx = (d().user_trophies || []).findIndex((ut) => ut.user_id === parseInt(userId) && ut.trophy_id === parseInt(trophyId));
      if (idx < 0) return false;
      d().user_trophies.splice(idx, 1);
      save();
      return true;
    },
  },
  system_settings: {
    getAll() {
      return d().system_settings || [];
    },
    get(key) {
      const s = (d().system_settings || []).find((x) => x.key === key);
      return s ? s.value : null;
    },
    set(key, value, description) {
      const list = d().system_settings || [];
      const s = list.find((x) => x.key === key);
      const val = String(value);
      if (s) {
        s.value = val;
        if (description != null) s.description = description;
      } else {
        list.push({ key, value: val, description: description || '' });
      }
      if (!d().system_settings) d().system_settings = list;
      save();
      return { key, value: val };
    },
  },
  activity_log: {
    getFeedForFollowers(followerUserId, limit = 50) {
      const followingIds = (d().subscriptions || []).filter((s) => s.follower_id === parseInt(followerUserId)).map((s) => s.user_id);
      if (followingIds.length === 0) return [];
      return (d().activity_log || [])
        .filter((a) => followingIds.includes(a.user_id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map((a) => {
          const u = d().users.find((x) => x.id === a.user_id);
          const username = u?.username || 'user';
          const avatar = u?.custom_avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u?.avatar_seed || u?.username || 'user'}`;
          let text = '';
          if (a.type === 'thread') text = `создал тему «${a.title || 'Без названия'}»`;
          else if (a.type === 'reply') text = `ответил в теме «${a.post_title || 'Без названия'}»`;
          else if (a.type === 'trophy') text = `получил трофей «${a.trophy_name || 'Трофей'}»`;
          return { ...a, username, avatar, text };
        });
    },
  },
};
export { RANKS };
