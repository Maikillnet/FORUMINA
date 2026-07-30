import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Search, MessageSquare, User, Shield,
  ChevronRight, MessageCircle, MessageSquarePlus, Zap, Lock,
  FileText, Award, X, ChevronLeft,
  Send, SendHorizontal, Trophy, Pencil, Image, List, Smile,
  Heart, ThumbsUp, Users, Trash2, UserPlus, UserMinus, Settings, Share2, Link, Repeat2, Paperclip, Folder, Download, Save, ArrowUpRight
} from 'lucide-react';
import * as api from './api';

import { theme, DEFAULT_CATEGORIES, TOP_NAV, DIRECT_POST_CATEGORIES } from './constants/theme';
import { LUCIDE_ICONS, getIconComponent } from './constants/icons';
import { getRankColor, getAvatarGlowStyles } from './constants/ranks';
import { getAvatarUrl, isOnline, isPlaceholderUrl, getWallAvatarUrl, isAdmin } from './utils/user';

import { AvatarWithFallback } from './components/ui/AvatarWithFallback';
import { UserLink, UserBanner } from './components/ui/UserLink';
import { PlusIcon } from './components/ui/PlusIcon';
import { PostSkeleton } from './components/ui/PostSkeleton';
import { RankBadge } from './components/ui/RankBadge';
import { ImageViewer } from './components/ui/ImageViewer';
import { Toast } from './components/ui/Toast';

import { ProfileBanner } from './components/forum/ProfileBanner';
import { TrophyCarousel } from './components/forum/TrophyCarousel';
import { ThreadActions } from './components/forum/ThreadActions';
import { SimpleMarkdown } from './components/forum/SimpleMarkdown';
import { PostCard } from './components/forum/PostCard';
import { ContentWithEmojis } from './components/forum/ContentWithEmojis';
import { UnifiedEmojiPicker } from './components/forum/UnifiedEmojiPicker';

import { MessagesPage } from './components/messaging/MessagesPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { AdminPanel } from './components/admin/AdminPanel';
import { ArticlesPage } from './pages/ArticlesPage';
import { ProfileEditModal } from './components/profile/ProfileEditModal';

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
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ posts: 0, users: 0, display_users: 0, display_messages: 0 });
  const [latestComments, setLatestComments] = useState([]);
  const [similarThreads, setSimilarThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [toast, setToast] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const openLightbox = useCallback((images, index = 0) => {
    const validImages = (Array.isArray(images) ? images : images ? [images] : []).filter((img) => img && typeof img === 'string');
    if (validImages.length > 0) setLightbox({ open: true, images: validImages, index: Math.min(index, validImages.length - 1) });
  }, []);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPosts, setSelectedUserPosts] = useState([]);
  const [wallPosts, setWallPosts] = useState([]);
  const [profileTab, setProfileTab] = useState('wall');
  const [userProfileTab, setUserProfileTab] = useState('wall');
  const [rankLoading, setRankLoading] = useState(false);
  const [commentImages, setCommentImages] = useState([]);
  const [commentDraft, setCommentDraft] = useState('');
  const commentImageInputRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const commentInputRef = useRef(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef(null);
  const [newPostImages, setNewPostImages] = useState([]);
  const [newPostCoverImage, setNewPostCoverImage] = useState(null);
  const [newPostAttachments, setNewPostAttachments] = useState([]);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState({ content: '', images: [] });
  const [editingWallPostId, setEditingWallPostId] = useState(null);
  const [editingWallPostDraft, setEditingWallPostDraft] = useState({ content: '', images: [], poll_question: '', poll_options: [] });
  const newPostImageInputRef = useRef(null);
  const newPostCoverInputRef = useRef(null);
  const newPostAttachmentInputRef = useRef(null);
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
  const wallEditImageInputRef = useRef(null);
  const wallEmojiPickerRefOther = useRef(null);
  const wallContentRefOther = useRef(null);
  const [wallCommentsOpenPostId, setWallCommentsOpenPostId] = useState(null);
  const [wallCommentDrafts, setWallCommentDrafts] = useState({});
  const [wallShareOpenPostId, setWallShareOpenPostId] = useState(null);
  const [wallRepostPostId, setWallRepostPostId] = useState(null);
  const [wallRepostCommentDraft, setWallRepostCommentDraft] = useState('');
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
  const [emojis, setEmojis] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { threadId: routeThreadId, userId: routeUserId, categoryId: routeCategoryId } = useParams();

  // The URL is the source of truth for navigation: clicking things updates
  // both state and the URL (see navigate() calls below), and this effect
  // handles the reverse direction — direct links, refresh, and back/forward
  // — by deriving view state from the current route and fetching whatever
  // that route needs that isn't already loaded.
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/category/')) {
      setActiveNav('forum');
      setView('feed');
      setActiveTab(routeCategoryId || 'all');
    } else if (/^\/thread\/[^/]+\/edit$/.test(path)) {
      setActiveNav('forum');
      if (String(selectedThread?.id) !== String(routeThreadId)) {
        api.getPost(routeThreadId, true).then((full) => {
          setSelectedThread(full);
          setEditingThreadId(full.id);
          setView('editor');
        }).catch(() => navigate('/', { replace: true }));
      } else {
        setEditingThreadId(selectedThread.id);
        setView('editor');
      }
    } else if (path.startsWith('/thread/')) {
      setActiveNav('forum');
      if (String(selectedThread?.id) !== String(routeThreadId)) {
        setLoading(true);
        api.getPost(routeThreadId).then((full) => {
          setSelectedThread(full);
          setView('thread');
        }).catch(() => {
          setSelectedThread(null);
          navigate('/', { replace: true });
        }).finally(() => setLoading(false));
      } else {
        setView('thread');
      }
    } else if (path === '/new') {
      setActiveNav('forum');
      setEditingThreadId(null);
      setView('editor');
    } else if (path === '/profile') {
      setActiveNav('forum');
      setSelectedUser(null);
      setView('profile');
    } else if (path.startsWith('/u/')) {
      setActiveNav('forum');
      if (String(selectedUser?.id) !== String(routeUserId)) {
        api.getUserProfile(routeUserId).then((p) => {
          setSelectedUser(p);
          setView('profile');
        }).catch(() => {
          setSelectedUser(null);
          navigate('/', { replace: true });
        });
      } else {
        setView('profile');
      }
    } else if (path.startsWith('/messages')) {
      setActiveNav('forum');
      setView('messages');
      if (routeUserId && String(activeChatUser?.id) !== String(routeUserId)) {
        api.getUserProfile(routeUserId).then((p) => {
          setActiveChatUser({ id: p.id, username: p.nickname || p.username, custom_avatar: p.custom_avatar, last_online: p.last_online });
          setChatHistory([]);
        }).catch(() => {});
      } else if (!routeUserId) {
        setActiveChatUser(null);
      }
    } else if (path === '/settings') {
      setActiveNav('forum');
      setView('settings');
    } else if (path === '/admin') {
      setActiveNav('forum');
      setView('admin');
    } else if (path === '/articles') {
      setActiveNav('articles');
      setView('feed');
    } else if (path === '/rules') {
      setActiveNav('rules');
      setView('feed');
    }
    // Deliberately reacting only to the URL (and the route params it carries) —
    // the id-comparison guards above read other state without needing it in
    // the dependency array, matching "only re-derive when the route changes".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, routeThreadId, routeUserId, routeCategoryId, navigate]);

  const loadEmojis = useCallback(async () => {
    try {
      const list = await api.getEmojis();
      setEmojis(list || []);
    } catch {
      setEmojis([]);
    }
  }, []);

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
      setUser(u ? { ...u, id: u.id, has_openai_key: !!u.has_openai_key } : null);
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
    } catch {
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
    api.onUnauthorized(() => {
      setUser(null);
      setToast({ message: 'Сессия истекла. Пожалуйста, войдите снова.', type: 'error' });
    });
  }, []);

  useEffect(() => {
    if (view === 'editor') {
      if (editingThreadId && selectedThread?.id === editingThreadId) {
        setNewPostCoverImage(selectedThread.cover_image || null);
        const imgs = selectedThread.images?.length ? selectedThread.images : (selectedThread.image ? [selectedThread.image] : []);
        setNewPostImages(imgs);
        setNewPostAttachments(selectedThread.attachments || []);
      } else if (!editingThreadId) {
        setNewPostCoverImage(null);
        setNewPostImages([]);
        setNewPostAttachments([]);
      }
    }
  }, [view, editingThreadId, selectedThread?.id, selectedThread?.cover_image, selectedThread?.images, selectedThread?.attachments]);

  useEffect(() => {
    loadSiteSettings();
    loadEmojis();
  }, [loadSiteSettings, loadEmojis]);

  useEffect(() => {
    document.title = siteSettings.site_name || 'Forum';
  }, [siteSettings.site_name]);

  useEffect(() => {
    if (!wallShareOpenPostId) return;
    const h = (e) => {
      if (e.target.closest('[data-wall-share]')) return;
      setWallShareOpenPostId(null);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [wallShareOpenPostId]);

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
    if (activeNav !== 'articles') return;
    setArticlesLoading(true);
    api.getPosts('Articles', 'new')
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setArticlesLoading(false));
  }, [activeNav]);

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

  useEffect(() => {
    if (selectedThread?.id) {
      api.getSimilarThreads(selectedThread.id).then(setSimilarThreads).catch(() => setSimilarThreads([]));
    } else setSimilarThreads([]);
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
    let interval;
    if (view === 'messages' && user?.id && activeChatUser?.id) {
      loadConversations();
      loadChatHistory();
      interval = setInterval(() => { loadConversations(); loadChatHistory(); }, 15000);
    } else if ((view === 'messages' || view === 'profile') && user?.id) {
      loadConversations();
      interval = setInterval(loadConversations, 15000);
    }
    return () => clearInterval(interval);
  }, [view, user?.id, activeChatUser?.id, loadConversations, loadChatHistory]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const handleStartChat = useCallback((targetUser) => {
    const u = targetUser?.id ? { ...targetUser } : { id: targetUser?.contactId, username: targetUser?.username || 'user', custom_avatar: targetUser?.avatar, last_online: targetUser?.last_online };
    if (activeChatUser?.id === u?.id) {
      setView('messages');
      navigate(`/messages/${u.id}`);
      return;
    }
    setChatLoading(true);
    setActiveChatUser(u);
    setChatHistory([]);
    setView('messages');
    navigate(`/messages/${u.id}`);
  }, [activeChatUser?.id, navigate]);

  const openChatWithUser = useCallback((contact) => {
    const contactId = contact?.contactId ?? contact?.id;
    if (activeChatUser?.id === contactId) return;
    const u = contact?.id ? { ...contact, id: contact.id } : { id: contactId, username: contact?.username || 'user', custom_avatar: contact?.avatar, last_online: contact?.last_online };
    setChatLoading(true);
    setActiveChatUser(u);
    setChatHistory([]);
  }, [activeChatUser?.id]);

  const handleSendPrivateMessage = useCallback(async (content, attachments = []) => {
    if (!user?.id || !activeChatUser?.id) return;
    if (!content?.trim() && (!attachments || attachments.length === 0)) return;
    try {
      const msg = await api.sendPrivateMessage(user.id, activeChatUser.id, content, attachments);
      setChatHistory(prev => [...prev, { ...msg, isMine: true }]);
      loadConversations();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка отправки', type: 'error' });
    }
  }, [user?.id, activeChatUser?.id, loadConversations, setToast]);

  const handleDeletePrivateMessage = useCallback(async (messageId) => {
    try {
      await api.deleteMessage(messageId);
      setChatHistory(prev => prev.filter((m) => m.id !== messageId));
      loadConversations();
      setToast({ message: 'Сообщение удалено', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка удаления', type: 'error' });
    }
  }, [loadConversations]);

  const handleTogglePinMessage = useCallback(async (messageId) => {
    const prev = chatHistory;
    setChatHistory((p) => p.map((m) => (m.id === messageId ? { ...m, is_pinned: true } : { ...m, is_pinned: false })));
    try {
      const updated = await api.togglePinMessage(messageId);
      setChatHistory((p) => p.map((m) => (m.id === messageId ? { ...m, ...updated, isMine: m.isMine } : { ...m, is_pinned: false })));
      setToast({ message: 'Сообщение закреплено', type: 'success' });
    } catch (err) {
      setChatHistory(prev);
      setToast({ message: err?.message || 'Ошибка закрепления', type: 'error' });
      throw err;
    }
  }, [chatHistory]);

  const handleUnpinMessage = useCallback(async (messageId) => {
    const prev = chatHistory;
    setChatHistory((p) => p.map((m) => (m.id === messageId ? { ...m, is_pinned: false } : m)));
    try {
      await api.unpinMessage(messageId);
      setToast({ message: 'Закрепление снято', type: 'success' });
    } catch (err) {
      setChatHistory(prev);
      setToast({ message: err?.message || 'Ошибка открепления', type: 'error' });
      throw err;
    }
  }, [chatHistory]);

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
    if (view === 'admin' && isAdmin(user)) {
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
      navigate('/profile');
      return;
    }
    setLoading(true);
    try {
      const profileUser = await api.getUserProfile(userId);
      setSelectedUser(profileUser);
      setView('profile');
      navigate(`/u/${userId}`);
      window.scrollTo(0, 0);
    } catch {
      setSelectedUser(null);
      setToast({ message: 'Пользователь не найден', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

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
      if (passVal.length < 8) {
        setAuthError('Пароль минимум 8 символов');
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

  const openThread = async (post, fromSearch = false) => {
    setLoading(true);
    try {
      if (fromSearch) api.postHit(post.id);
      const viewedKey = `forum_viewed_${post.id}`;
      const skipView = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(viewedKey);
      const full = await api.getPost(post.id, !!skipView);
      if (!skipView && typeof sessionStorage !== 'undefined') sessionStorage.setItem(viewedKey, '1');
      setSelectedThread(full);
      setView('thread');
      navigate(`/thread/${post.id}`);
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
    const isEdit = !!editingThreadId;
    try {
      if (isEdit) {
        await api.updatePost(editingThreadId, { title, content, category, tags, images: newPostImages, cover_image: newPostCoverImage, attachments: newPostAttachments });
        setView('thread');
        const updated = await api.getPost(editingThreadId);
        setSelectedThread(updated);
        navigate(`/thread/${editingThreadId}`);
        setEditingThreadId(null);
        loadPosts();
        loadStats();
        setToast({ message: 'Изменения сохранены!', type: 'success' });
      } else {
        await api.createPost(title, content, category, tags, newPostImages, newPostCoverImage, newPostAttachments);
        setView('feed');
        navigate('/');
        loadPosts();
        loadStats();
        setToast({ message: 'Тема опубликована!', type: 'success' });
      }
      setNewPostImages([]);
      setNewPostCoverImage(null);
      setNewPostAttachments([]);
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const content = commentDraft?.trim();
    if ((!content && commentImages.length === 0) || !selectedThread) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const comment = await api.addComment(selectedThread.id, content || '', commentImages, replyTo?.id || null);
      const enriched = { ...comment, author_avatar: getAvatarUrl(user), rank: user.rank, rank_color: user.rank_color, likes: 0, liked: false };
      setComments(prev => [...prev, enriched]);
      setCommentDraft('');
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

  const handleStartEditComment = (c) => {
    setEditingCommentId(c.id);
    const imgs = c.images?.length ? c.images : (c.image ? [c.image] : []);
    setEditingCommentDraft({ content: c.content || '', images: [...imgs] });
  };

  const handleSaveComment = async () => {
    if (!selectedThread || !editingCommentId) return;
    if (!editingCommentDraft.content?.trim() && editingCommentDraft.images.length === 0) {
      setToast({ message: 'Введите текст или прикрепите фото', type: 'error' });
      return;
    }
    try {
      const updated = await api.updateComment(selectedThread.id, editingCommentId, editingCommentDraft.content, editingCommentDraft.images);
      setComments(prev => prev.map(c => c.id === editingCommentId ? { ...c, content: updated.content, images: updated.images } : c));
      setEditingCommentId(null);
      setToast({ message: 'Комментарий сохранён', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
  };

  const handleDeleteComment = async (c) => {
    if (!selectedThread) return;
    if (!confirm('Удалить комментарий? Вложенные ответы также будут удалены.')) return;
    try {
      await api.deleteComment(selectedThread.id, c.id);
      const idsToRemove = (() => {
        let ids = new Set([c.id]);
        let added = true;
        while (added) {
          added = false;
          for (const x of comments) {
            if (ids.has(x.parent_id) && !ids.has(x.id)) { ids.add(x.id); added = true; }
          }
        }
        return [...ids];
      })();
      setComments(prev => prev.filter((x) => !idsToRemove.includes(x.id)));
      setToast({ message: 'Комментарий удалён', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
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

  const handleStartEditWallPost = (w) => {
    setEditingWallPostId(w.id);
    const imgs = w.images?.length ? w.images : (w.image ? [w.image] : []);
    setEditingWallPostDraft({
      content: w.content || '',
      images: [...imgs],
      poll_question: w.poll_question || '',
      poll_options: Array.isArray(w.poll_options) ? [...w.poll_options] : [],
    });
  };

  const handleSaveWallPost = async () => {
    if (!profileUserId || !editingWallPostId) return;
    if (!editingWallPostDraft.content?.trim() && editingWallPostDraft.images.length === 0 && !editingWallPostDraft.poll_question?.trim()) {
      setToast({ message: 'Введите текст, прикрепите фото или добавьте голосование', type: 'error' });
      return;
    }
    try {
      const updated = await api.updateWallPost(profileUserId, editingWallPostId, {
        content: editingWallPostDraft.content,
        images: editingWallPostDraft.images,
        poll_question: editingWallPostDraft.poll_question || null,
        poll_options: editingWallPostDraft.poll_options?.filter(Boolean).length >= 2 ? editingWallPostDraft.poll_options : null,
      });
      setWallPosts(prev => prev.map(p => p.id === editingWallPostId ? { ...p, ...updated } : p));
      setEditingWallPostId(null);
      setToast({ message: 'Пост сохранён', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleCancelEditWallPost = () => {
    setEditingWallPostId(null);
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

  const handleDeleteWallComment = useCallback(async (postId, commentId) => {
    if (!user || !profileUserId) return;
    if (!confirm('Удалить комментарий?')) return;
    try {
      await api.deleteWallComment(profileUserId, postId, commentId);
      setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
      setToast({ message: 'Комментарий удалён', type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка удаления', type: 'error' });
    }
  }, [user, profileUserId]);

  const handleRepostWallPost = useCallback(async (w, userComment = '') => {
    if (!user) { setShowAuth(true); return; }
    setWallShareOpenPostId(null);
    if (w.thread_id) {
      try {
        const threadImage = w.thread_image || w.image || (w.images?.[0]);
        await api.postWall(user.id, userComment || '', w.thread_id, w.thread_title || 'Тема', [], null, null, threadImage);
        setToast({ message: 'Опубликовано в профиле', type: 'success' });
      } catch (err) {
        setToast({ message: err?.message || 'Ошибка', type: 'error' });
      }
    } else {
      const url = `${window.location.origin}${window.location.pathname || '/'}?profile=${profileUserId}`;
      navigator.clipboard.writeText(url).then(() => setToast({ message: 'Ссылка скопирована', type: 'success' })).catch(() => setToast({ message: 'Не удалось скопировать', type: 'error' }));
    }
    setWallRepostPostId(null);
    setWallRepostCommentDraft('');
  }, [user, profileUserId]);

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
                onClick={() => navigate(item.id === 'forum' ? '/' : `/${item.id}`)}
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
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
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
                  <div key={p.id} onClick={() => { openThread(p, true); setSearchResults([]); setSearchQuery(''); }} className="p-3 hover:bg-[#1c2128] cursor-pointer">
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
                {isAdmin(user) && (
                  <button onClick={() => navigate('/admin')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold uppercase transition-colors">
                    <Shield size={14} /> Админ
                  </button>
                )}
                <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer group">
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

      <main className={`max-w-[1400px] mx-auto px-6 md:px-8 py-6 grid grid-cols-1 gap-6 ${view === 'profile' || view === 'admin' || view === 'messages' || view === 'settings' ? 'lg:grid-cols-1' : 'lg:grid-cols-[250px_1fr_300px]'}`}>
        <aside className={`hidden space-y-6 ${view === 'profile' || view === 'admin' || view === 'messages' || view === 'settings' ? 'lg:hidden' : 'lg:block'}`}>
          <button
            onClick={() => { if (user) navigate('/new'); else { setShowAuth(true); setAuthMode('login'); } }}
            className="w-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-accent)] hover:text-black transition-all group"
          >
            <MessageSquarePlus size={18} /> СОЗДАТЬ ТЕМУ
          </button>

          <button
            onClick={() => navigate('/messages')}
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
                  onClick={() => navigate(cat.id === 'all' ? '/' : `/category/${cat.id}`)}
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
              {posts.slice(0, 3).map((p) => (
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
          {view === 'settings' && (
            <SettingsPage
              user={user}
              setUser={setUser}
              setToast={setToast}
              onBack={() => navigate('/profile')}
              onSaveSuccess={() => loadUser()}
              onMountRefresh={loadUser}
            />
          )}

          {view === 'messages' && (
            <MessagesPage
              user={user}
              activeChatUser={activeChatUser}
              conversations={conversations}
              chatHistory={chatHistory}
              loading={chatLoading}
              onSelectContact={openChatWithUser}
              onSend={handleSendPrivateMessage}
              onDeleteMessage={handleDeletePrivateMessage}
              onTogglePin={handleTogglePinMessage}
              onUnpin={handleUnpinMessage}
              setToast={setToast}
              getAvatarUrl={getAvatarUrl}
              openLightbox={openLightbox}
              emojis={emojis}
              onOpenProfile={() => navigate('/profile')}
              onOpenSettings={() => navigate('/settings')}
            />
          )}

          {view === 'feed' && activeNav === 'forum' && (
            <>
              <div className="flex items-center gap-2 text-[11px] text-[#484f58] font-bold uppercase tracking-wider">
                <button onClick={() => navigate('/')} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
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
                    <PostCard key={post.id} post={post} onClick={openThread} onAuthorClick={openUserProfile} categoryColor={getCategoryStyle(post.category)?.color} onViewImage={openLightbox} />
                  ))
                )}
              </div>
            </>
          )}

          {activeNav === 'articles' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Статьи и гайды</h2>
                {user && (
                  <button onClick={() => navigate('/new')} className="text-xs font-bold text-[var(--color-accent)] hover:underline">
                    Написать статью
                  </button>
                )}
              </div>
              <ArticlesPage articles={articles} loading={articlesLoading} onOpenArticle={openThread} onAuthorClick={openUserProfile} />
            </>
          )}

          {activeNav === 'rules' && (
            <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-black text-white italic border-b border-[#30363d] pb-4">ПРАВИЛА СООБЩЕСТВА</h2>
              <div className="text-sm leading-relaxed">
                {siteSettings.rules_content ? (
                  <SimpleMarkdown emojis={emojis}>{siteSettings.rules_content}</SimpleMarkdown>
                ) : (
                  <p className="text-[#8b949e]">Правила ещё не опубликованы.</p>
                )}
              </div>
              <button onClick={() => navigate('/')} className="w-full bg-[#30363d] text-white py-2 rounded font-bold text-xs uppercase hover:bg-[var(--color-accent)] hover:text-black transition-all">Я ознакомлен с правилами</button>
            </div>
          )}

          {view === 'thread' && selectedThread && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[11px] text-[#484f58] font-bold uppercase tracking-wider">
                <button onClick={() => navigate('/')} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
                <ChevronRight size={12} />
                <button onClick={() => navigate(`/category/${selectedThread.category}`)} className="hover:text-[var(--color-accent)] transition-colors">{selectedThread.category}</button>
              </div>
              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-bold text-[#8b949e] hover:text-white mb-2 group transition-colors">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> НАЗАД К ЛЕНТЕ
              </button>

              <div className="bg-[var(--bg-block-glass)] backdrop-blur-xl border border-[#30363d] rounded-xl shadow-2xl">
                {selectedThread.cover_image && (
                  <div className="relative w-full h-80 overflow-hidden rounded-t-xl border-b border-white/10 cursor-zoom-in" onClick={() => {
                    const imgs = (selectedThread.images?.length ? selectedThread.images : (selectedThread.image ? [selectedThread.image] : []));
                    const all = [selectedThread.cover_image, ...imgs].filter(Boolean);
                    openLightbox(all, 0);
                  }}>
                    <img src={selectedThread.cover_image} alt="" className="w-full h-80 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-block)] via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <UserLink userId={selectedThread.author_id} username={selectedThread.author} avatarUrl={selectedThread.author_avatar || getAvatarUrl({ username: selectedThread.author })} rank={selectedThread.rank} rankColor={selectedThread.rank_color} size="lg" onClick={openUserProfile} />
                    <p className="text-[11px] text-[#8b949e] font-medium ml-2">{selectedThread.time} • {selectedThread.replies ?? comments.length} сообщений</p>
                  </div>

                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-normal leading-snug mb-6 break-all overflow-hidden">{selectedThread.title}</h1>
                  {selectedThread.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedThread.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[10px] bg-[#30363d] text-[#8b949e] px-2 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-invert prose-emerald max-w-none break-all whitespace-pre-wrap">
                    <SimpleMarkdown emojis={emojis}>{selectedThread.content || ''}</SimpleMarkdown>
                  </div>
                  {/* Thread Images */}
                  {(() => {
                    const imgs = (selectedThread.images?.length ? selectedThread.images : (selectedThread.image ? [selectedThread.image] : []));
                    if (imgs.length === 0) return null;

                    // Single Image: Banner Style
                    if (imgs.length === 1) return (
                      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 shadow-lg group/image">
                        <img
                          src={imgs[0]}
                          onClick={() => openLightbox(imgs, 0)}
                          alt=""
                          className="w-full h-80 object-cover cursor-zoom-in transition-transform duration-500 group-hover/image:scale-105"
                        />
                      </div>
                    );

                    // Multiple Images: Grid
                    return (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {imgs.map((src, i) => (
                          <div key={i} className="overflow-hidden rounded-lg border border-white/10 group/image">
                            <img
                              src={src}
                              onClick={() => openLightbox(imgs, i)}
                              alt=""
                              className="w-full h-48 object-cover cursor-zoom-in transition-transform duration-500 group-hover/image:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {(selectedThread.attachments?.length || 0) > 0 && (
                    <div className="mt-6 pt-6 border-t border-[#30363d]">
                      <h5 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={14} /> Файлы
                      </h5>
                      <div className="flex flex-col gap-2">
                        {selectedThread.attachments.map((a, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors">
                            <FileText size={20} className="text-[var(--color-accent)] flex-shrink-0" />
                            <span className="text-sm text-white truncate flex-1">{a.name}</span>
                            <span className="text-[10px] text-[#8b949e]">{(a.size / 1024).toFixed(1)} KB</span>
                            <a href={a.data} download={a.name} className="p-2 rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 transition-colors">
                              <Download size={16} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[var(--bg-main)]/50 p-4 border-t border-[#30363d] flex items-center justify-between">
                  <ThreadActions
                    thread={selectedThread}
                    user={user}
                    onEdit={() => navigate(`/thread/${selectedThread.id}/edit`)}
                    onDelete={async () => {
                      if (!confirm('Удалить тему? Это действие нельзя отменить.')) return;
                      try {
                        await api.deletePost(selectedThread.id);
                        setView('feed');
                        navigate('/');
                        setSelectedThread(null);
                        loadPosts();
                        loadStats();
                        setToast({ message: 'Тема удалена', type: 'success' });
                      } catch (err) {
                        setToast({ message: err?.message || 'Ошибка', type: 'error' });
                      }
                    }}
                    onCopyLink={() => {
                      const url = `${window.location.origin}${window.location.pathname || '/'}?post=${selectedThread.id}`;
                      navigator.clipboard.writeText(url).then(() => setToast({ message: 'Ссылка скопирована', type: 'success' })).catch(() => setToast({ message: 'Не удалось скопировать', type: 'error' }));
                    }}
                    onRepost={async (userComment) => {
                      if (!user) { setShowAuth(true); return; }
                      try {
                        const threadImage = selectedThread.cover_image || selectedThread.images?.[0] || null;
                        await api.postWall(user.id, userComment || '', selectedThread.id, selectedThread.title, [], null, null, threadImage);
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
                    const canEditComment = user && (c.author_id === user.id || isAdmin(user));
                    const isEditing = editingCommentId === c.id;
                    const draft = isEditing ? editingCommentDraft : null;
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
                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={draft?.content ?? ''}
                              onChange={(e) => setEditingCommentDraft(prev => ({ ...prev, content: e.target.value }))}
                              className="w-full min-h-[80px] py-2 px-3 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)] resize-none"
                              placeholder="Текст комментария..."
                            />
                            {draft?.images?.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {draft.images.map((src, i) => (
                                  <div key={i} className="relative flex-shrink-0">
                                    <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover ring-1 ring-white/10" />
                                    <button type="button" onClick={() => setEditingCommentDraft(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors"><X size={10} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={handleSaveComment} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)] text-black rounded-lg text-xs font-bold hover:opacity-90">
                                <Save size={14} /> Сохранить
                              </button>
                              <button type="button" onClick={handleCancelEditComment} className="flex items-center gap-1.5 px-3 py-1.5 text-[#8b949e] hover:text-white rounded-lg text-xs font-bold">
                                <X size={14} /> Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-white/90 leading-relaxed break-words whitespace-pre-wrap"><ContentWithEmojis text={c.content} emojis={emojis} /></p>
                            {/* Comment Images */}
                            {(() => {
                              const imgs = (c.images?.length ? c.images : (c.image ? [c.image] : []));
                              if (imgs.length === 0) return null;

                              // Single Image: Small Thumbnail
                              if (imgs.length === 1) return (
                                <div className="mt-2 overflow-hidden rounded-lg border border-white/10 group/image max-w-xs">
                                  <img
                                    src={imgs[0]}
                                    onClick={(e) => { e.stopPropagation(); openLightbox(imgs, 0); }}
                                    alt=""
                                    className="w-48 h-32 object-cover cursor-zoom-in transition-transform duration-500 group-hover/image:scale-105"
                                  />
                                </div>
                              );

                              // Multiple Images: Tiny Grid
                              return (
                                <div className="mt-2 grid grid-cols-3 gap-1 max-w-xs">
                                  {imgs.map((src, i) => (
                                    <div key={i} className="overflow-hidden rounded-md border border-white/5 group/image">
                                      <img
                                        src={src}
                                        onClick={(e) => { e.stopPropagation(); openLightbox(imgs, i); }}
                                        alt=""
                                        className="w-20 h-20 object-cover cursor-zoom-in transition-transform duration-500 group-hover/image:scale-105"
                                      />
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </>
                        )}
                        {!isEditing && (
                        <div className="flex items-center justify-between mt-3 pt-3 bg-white/[0.02] rounded-lg -mx-1 px-3 -mb-1 opacity-50 group-hover/comment:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center gap-4">
                            <button type="button" onClick={() => { setReplyTo({ id: c.id, author: c.author }); setTimeout(() => commentInputRef.current?.focus(), 0); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors duration-300">
                              <MessageCircle size={10} />
                              Ответить
                            </button>
                            <button type="button" onClick={() => handleLikeComment(c)} className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${c.liked ? 'text-red-500' : 'text-gray-500 hover:text-blue-400'}`}>
                              <Heart size={10} className={c.liked ? 'fill-current' : ''} />
                              {c.likes ?? 0}
                            </button>
                          </div>
                          {canEditComment && (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => handleStartEditComment(c)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Редактировать">
                                <Pencil size={14} />
                              </button>
                              <button type="button" onClick={() => handleDeleteComment(c)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors" title="Удалить">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        )}
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
                              value={commentDraft}
                              onChange={(e) => {
                                setCommentDraft(e.target.value);
                                const ta = e.target;
                                ta.style.height = 'auto';
                                ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
                              }}
                              rows={1}
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
                                <UnifiedEmojiPicker emojis={emojis} open={emojiPickerOpen} onClose={() => setEmojiPickerOpen(false)} onSelect={(insert) => {
                                  const ta = commentInputRef.current;
                                  if (ta) {
                                    const start = ta.selectionStart, end = ta.selectionEnd;
                                    ta.value = ta.value.slice(0, start) + insert + ta.value.slice(end);
                                    ta.selectionStart = ta.selectionEnd = start + insert.length;
                                    ta.focus();
                                  }
                                }} className="w-[600px] max-w-[min(42rem,calc(100vw-2rem))]" />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={!commentDraft.trim() && commentImages.length === 0}
                              className={`
                                relative group flex items-center justify-center
                                p-3 sm:p-3.5 rounded-full text-white
                                bg-gradient-to-br from-[var(--color-accent)] to-indigo-600
                                shadow-lg shadow-[var(--color-accent)]/30
                                hover:shadow-[var(--color-accent)]/50 hover:scale-105 hover:brightness-110
                                active:scale-95
                                disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:brightness-100
                                transition-all duration-300 ease-out shrink-0 ml-4
                              `}
                            >
                              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <SendHorizontal size={20} className="relative z-10 -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
                            </button>
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
                <span className="text-xs font-black uppercase tracking-widest text-white">{editingThreadId ? 'Редактировать тему' : 'Новое обсуждение'}</span>
                <button onClick={() => { const wasEditing = editingThreadId; setEditingThreadId(null); setView(wasEditing ? 'thread' : 'feed'); navigate(wasEditing ? `/thread/${wasEditing}` : '/'); }} aria-label="Закрыть редактор" className="text-[#484f58] hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form key={editingThreadId ? `edit-${editingThreadId}` : 'new'} onSubmit={handlePublish} className="p-6 md:p-8 space-y-4">
                <input name="title" defaultValue={editingThreadId && selectedThread?.id === editingThreadId ? selectedThread.title : ''} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-3 text-lg font-bold text-white focus:outline-none focus:border-[var(--color-accent)] transition-all" placeholder="Заголовок темы..." required />
                <div>
                  <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Обложка темы (баннер)</label>
                  {newPostCoverImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#30363d] bg-[var(--bg-main)]">
                      <img src={newPostCoverImage} alt="" className="w-full max-h-48 object-cover" />
                      <button type="button" onClick={() => setNewPostCoverImage(null)} aria-label="Удалить обложку" className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 rounded-lg flex items-center justify-center text-white hover:bg-red-500"><X size={16} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => newPostCoverInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[#30363d] hover:border-[var(--color-accent)]/50 flex items-center justify-center gap-2 text-[#8b949e] hover:text-[var(--color-accent)] transition-all">
                      <Image size={24} /> Загрузить обложку
                    </button>
                  )}
                  <input ref={newPostCoverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f || f.size > 5 * 1024 * 1024) { setToast({ message: 'Изображение до 5 МБ', type: 'error' }); return; }
                    const r = new FileReader(); r.onload = () => setNewPostCoverImage(r.result); r.readAsDataURL(f);
                    e.target.value = '';
                  }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select name="category" defaultValue={editingThreadId && selectedThread?.id === editingThreadId ? selectedThread.category : ''} className="bg-[var(--bg-main)] border border-[#30363d] rounded px-3 py-1.5 text-xs font-bold text-[var(--color-accent)]" required>
                    <option value="">Выбрать раздел</option>
                    {(categories.filter(c => DIRECT_POST_CATEGORIES.includes(c.id)).length ? categories.filter(c => DIRECT_POST_CATEGORIES.includes(c.id)) : DIRECT_POST_CATEGORIES.map(id => ({ id, name: id }))).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input name="tags" defaultValue={editingThreadId && selectedThread?.id === editingThreadId ? (selectedThread.tags || '') : ''} className="flex-1 min-w-[120px] bg-[var(--bg-main)] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#8b949e]" placeholder="Теги (через запятую)..." />
                </div>
                <textarea name="content" defaultValue={editingThreadId && selectedThread?.id === editingThreadId ? (selectedThread.content || '') : ''} className="w-full h-64 bg-[var(--bg-main)] border border-[#30363d] rounded-lg p-4 text-sm text-[#c9d1d9] resize-none focus:outline-none focus:border-[var(--color-accent)]" placeholder="Напишите содержимое здесь... (Поддерживается Markdown)" required />
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" onClick={() => newPostImageInputRef.current?.click()} className="p-2 rounded-lg border border-[#30363d] hover:border-[var(--color-accent)]/50 text-[#8b949e] hover:text-[var(--color-accent)] transition-colors" title="Прикрепить фото"><Image size={18} /></button>
                  <button type="button" onClick={() => newPostAttachmentInputRef.current?.click()} className="p-2 rounded-lg border border-[#30363d] hover:border-[var(--color-accent)]/50 text-[#8b949e] hover:text-[var(--color-accent)] transition-colors" title="Прикрепить файл"><Paperclip size={18} /></button>
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
                  <input ref={newPostAttachmentInputRef} type="file" accept=".zip,.rar,.7z,.tar,.gz,.pdf,.txt,.js,.ts,.json,.md,.py,.java,.cpp,.c,.h,.css,.html,.xml" multiple className="hidden" onChange={(e) => {
                    const files = [...(e.target.files || [])];
                    const MAX = 5 * 1024 * 1024;
                    const valid = files.filter(f => f.size <= MAX);
                    if (files.length !== valid.length) setToast({ message: 'Файлы до 5 МБ каждый', type: 'error' });
                    if (valid.length === 0) return;
                    Promise.all(valid.map(f => new Promise((res) => {
                      const r = new FileReader();
                      r.onload = () => res({ name: f.name, type: f.type, size: f.size, data: r.result });
                      r.readAsDataURL(f);
                    }))).then(items => setNewPostAttachments(prev => [...prev, ...items].slice(0, 10)));
                    e.target.value = '';
                  }} />
                </div>
                {newPostAttachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#8b949e] uppercase">Прикреплённые файлы</span>
                    <div className="flex flex-col gap-2">
                      {newPostAttachments.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-main)] border border-[#30363d]">
                          <FileText size={18} className="text-[var(--color-accent)] flex-shrink-0" />
                          <span className="text-sm text-white truncate flex-1">{a.name}</span>
                          <span className="text-[10px] text-[#8b949e]">{(a.size / 1024).toFixed(1)} KB</span>
                          <button type="button" onClick={() => setNewPostAttachments(prev => prev.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {newPostImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                    {newPostImages.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={src} alt="" className="max-h-24 rounded-lg border border-[#30363d] object-cover" />
                        <button type="button" onClick={() => setNewPostImages(prev => prev.filter((_, j) => j !== i))} aria-label="Удалить изображение" className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { const wasEditing = editingThreadId; setEditingThreadId(null); setView(wasEditing ? 'thread' : 'feed'); navigate(wasEditing ? `/thread/${wasEditing}` : '/'); }} className="px-6 py-2 text-sm font-bold text-[#8b949e] hover:text-white transition-colors">ОТМЕНА</button>
                  <button type="submit" className="bg-[var(--color-accent)] text-black px-8 py-2 rounded-lg font-black text-xs hover:bg-[color:var(--color-accent)]/90 transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center gap-2">
                    {editingThreadId ? <><Save size={16} /> Сохранить изменения</> : 'ОПУБЛИКОВАТЬ'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {view === 'admin' && isAdmin(user) && (
            <AdminPanel
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              adminTrophies={adminTrophies}
              setAdminTrophies={setAdminTrophies}
              adminUsers={adminUsers}
              grantTrophyTarget={grantTrophyTarget}
              setGrantTrophyTarget={setGrantTrophyTarget}
              setToast={setToast}
              setView={(v) => { setView(v); if (v === 'feed') navigate('/'); }}
              getAvatarUrl={getAvatarUrl}
              categories={categories}
              loadCategories={loadCategories}
              refreshSiteSettings={loadSiteSettings}
              onPreviewPattern={(p) => setSiteSettings(s => ({ ...s, site_pattern: p || '' }))}
              emojis={emojis}
              loadEmojis={loadEmojis}
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
                <button onClick={() => navigate('/')} className="hover:text-[var(--color-accent)] transition-colors">ФОРУМ</button>
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
                          isAdmin={isAdmin(user)}
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
                      <>
                        <button onClick={() => setShowProfileEdit(true)} type="button" className="w-full mt-4 flex items-center justify-center gap-2 h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm font-medium">
                          <Pencil size={16} className="w-4 h-4" /> Редактировать
                        </button>
                        <button onClick={() => navigate('/settings')} type="button" className="w-full mt-2 flex items-center justify-center gap-2 h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all text-sm font-medium">
                          <Settings size={16} className="w-4 h-4" /> Настройки
                        </button>
                      </>
                    )}
                    {user && selectedUser && selectedUser.id !== user.id && (
                      <div className="flex flex-col gap-3 w-full mt-4">
                        <button
                          type="button"
                          onClick={() => handleStartChat(selectedUser)}
                          disabled={!selectedUser?.can_message}
                          className={`w-full h-11 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium ${!selectedUser?.can_message ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-[var(--color-accent)] hover:opacity-90 text-white'}`}
                          title={!selectedUser?.can_message ? 'Пользователь закрыл приём сообщений' : ''}
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
                  <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">ПОДПИСКИ</h3>
                        <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-400 border border-white/10">{(selectedUser ? selectedUserSubscriptions : subscriptions).length}</span>
                      </div>
                      <button type="button" onClick={() => { const subs = selectedUser ? selectedUserSubscriptions : subscriptions; if (subs.length > 0) selectedUser ? setUserProfileTab('subscriptions') : setProfileTab('subscriptions'); }} className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-0.5 group/all">
                        Смотреть всех
                        <ChevronRight size={10} className="group-hover/all:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(selectedUser ? selectedUserSubscriptions : subscriptions).length === 0 ? (
                        <p className="text-[11px] text-gray-500">Нет подписок</p>
                      ) : (
                        (selectedUser ? selectedUserSubscriptions : subscriptions).slice(0, 8).map(s => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer group border border-transparent hover:border-white/10"
                            onClick={() => openUserProfile(s.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-[var(--color-accent)]/40 transition-all">
                                  <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${s.is_online ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`} title={s.is_online ? 'В сети' : 'Офлайн'} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors truncate">{s.username}</span>
                                <span className={`text-[10px] uppercase tracking-tighter ${getRankColor(s.rank)}`}>{s.rank || 'Юзер'}</span>
                              </div>
                            </div>
                            <ArrowUpRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all -translate-x-2 group-hover:translate-x-0 flex-shrink-0" />
                          </div>
                        ))
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
                                    <UnifiedEmojiPicker emojis={emojis} open={wallEmojiPickerOpen} onClose={() => setWallEmojiPickerOpen(false)} onSelect={(insert) => {
                                      const ta = wallInputRef.current;
                                      if (ta) {
                                        const start = ta.selectionStart, end = ta.selectionEnd;
                                        setPostData(prev => ({ ...prev, text: prev.text.slice(0, start) + insert + prev.text.slice(end) }));
                                        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + insert.length; ta.focus(); }, 0);
                                      }
                                    }} className="w-[600px] max-w-[min(42rem,calc(100vw-2rem))]" />
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
                                    <UnifiedEmojiPicker emojis={emojis} open={wallEmojiPickerOpenOther} onClose={() => setWallEmojiPickerOpenOther(false)} onSelect={(insert) => {
                                      const ta = wallContentRefOther.current;
                                      if (ta) {
                                        const start = ta.selectionStart, end = ta.selectionEnd;
                                        setWallInputOther(prev => prev.slice(0, start) + insert + prev.slice(end));
                                        ta.focus();
                                        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + insert.length; });
                                      }
                                    }} className="w-[600px] max-w-[min(42rem,calc(100vw-2rem))]" />
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
                        {wallPosts.length === 0 ? (
                          <div className="py-16 text-center bg-[#181818]/50 rounded-xl border border-[#333] border-dashed">
                            <p className="text-[#888] text-sm">На стене пока нет ни одного сообщения</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {wallPosts.map(w => {
                              const isProfileOwner = (w.author_id === profileUserId) || (w.user_id === profileUserId && w.author_id === w.user_id);
                              const canEditWallPost = user && (w.author_id === user.id || isAdmin(user));
                              const isEditingWall = editingWallPostId === w.id;
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
                              <div key={w.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl mb-6 shadow-2xl">
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
                                  {isEditingWall ? (
                                    <div className="space-y-4 mb-4">
                                      <textarea
                                        value={editingWallPostDraft.content}
                                        onChange={(e) => setEditingWallPostDraft(prev => ({ ...prev, content: e.target.value }))}
                                        className="w-full min-h-[100px] py-2 px-3 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-accent)] resize-none"
                                        placeholder="Текст поста..."
                                      />
                                      {editingWallPostDraft.images?.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                          {editingWallPostDraft.images.map((src, i) => (
                                            <div key={i} className="relative flex-shrink-0">
                                              <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover ring-1 ring-white/10" />
                                              <button type="button" onClick={() => setEditingWallPostDraft(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors"><X size={10} /></button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => wallEditImageInputRef.current?.click()} className="p-2 rounded-lg border border-[#30363d] hover:border-[var(--color-accent)]/50 text-[#8b949e] hover:text-[var(--color-accent)] transition-colors" title="Прикрепить фото"><Image size={18} /></button>
                                        <button type="button" onClick={handleSaveWallPost} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)] text-black rounded-lg text-xs font-bold hover:opacity-90">
                                          <Save size={14} /> Сохранить
                                        </button>
                                        <button type="button" onClick={handleCancelEditWallPost} className="flex items-center gap-1.5 px-3 py-1.5 text-[#8b949e] hover:text-white rounded-lg text-xs font-bold">
                                          <X size={14} /> Отмена
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                  <>
                                  {(w.content || '').trim() && <p className="text-sm text-white/90 whitespace-pre-wrap break-words mb-4"><ContentWithEmojis text={w.content} emojis={emojis} /></p>}
                                  {w.thread_id && (
                                    <div
                                      onClick={(e) => { e.stopPropagation(); openThread({ id: w.thread_id }); }}
                                      className="mt-4 relative group/card overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_25px_-10px_var(--color-accent)] transition-all duration-500 cursor-pointer flex"
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                      {w.thread_image && (
                                        <div className="w-28 sm:w-32 h-full min-h-[96px] relative overflow-hidden flex-shrink-0 rounded-l-xl cursor-zoom-in" onClick={(e) => { e.stopPropagation(); openLightbox([w.thread_image], 0); }}>
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/90 z-10 pointer-events-none" />
                                          <img src={w.thread_image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                                        </div>
                                      )}
                                      <div className="flex-1 p-4 relative z-20 flex flex-col justify-center min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-black tracking-[0.2em] text-[var(--color-accent)] uppercase flex items-center gap-1.5">
                                            <Repeat2 size={10} />
                                            Репост темы
                                          </span>
                                          <ArrowUpRight size={14} className="text-[#444] group-hover/card:text-white group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-all duration-300" />
                                        </div>
                                        <h4 className="text-sm sm:text-base font-bold text-white leading-tight group-hover/card:text-[var(--color-accent)] transition-colors duration-300 line-clamp-2">
                                          {w.thread_title || 'Тема'}
                                        </h4>
                                        <div className="mt-2 text-[10px] text-gray-500 group-hover/card:text-gray-400 flex items-center gap-2">
                                          <span>Читать полностью</span>
                                          <div className="h-px w-4 bg-gray-700 group-hover/card:w-8 group-hover/card:bg-[var(--color-accent)] transition-all duration-500" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {/* Wall Post Images */}
                                  {images.length > 0 && (
                                    <div className={`mt-3 ${images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                                      {images.map((src, i) => (
                                        <div
                                          key={i}
                                          className="relative overflow-hidden group/image border border-white/10 rounded-xl"
                                        >
                                          <img
                                            src={src}
                                            onClick={(e) => { e.stopPropagation(); openLightbox(images, i); }}
                                            alt="attachment"
                                            className={`w-full object-cover object-center cursor-zoom-in transition-transform duration-500 group-hover/image:scale-105 ${images.length === 1 ? 'h-64' : 'h-48'}`}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
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
                                          const canDeleteWallComment = user && (user.id === c.user_id || user.id === w.user_id || user.is_admin);
                                          return (
                                          <div key={c.id} className="flex gap-3 group/comment">
                                            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                                              <AvatarWithFallback src={avatarSrc} alt={c.username} fallbackLetter={c.username} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs font-medium text-white">{c.username}</span>
                                                  <span className="text-[10px] text-white/50">{c.time}</span>
                                                </div>
                                                {canDeleteWallComment && (
                                                  <button type="button" onClick={() => handleDeleteWallComment(w.id, c.id)} className="opacity-0 group-hover/comment:opacity-100 p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full transition-all" title="Удалить"><Trash2 size={12} /></button>
                                                )}
                                              </div>
                                              <p className="text-sm text-white/80 break-words whitespace-normal mt-0.5"><ContentWithEmojis text={c.content} emojis={emojis} /></p>
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
                                            <button
                                            type="submit"
                                            disabled={!commentDraft.trim()}
                                            className={`
                                              relative group flex items-center justify-center
                                              p-3 sm:p-3.5 rounded-full text-white
                                              bg-gradient-to-br from-[var(--color-accent)] to-indigo-600
                                              shadow-lg shadow-[var(--color-accent)]/30
                                              hover:shadow-[var(--color-accent)]/50 hover:scale-105 hover:brightness-110
                                              active:scale-95
                                              disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:brightness-100
                                              transition-all duration-300 ease-out shrink-0
                                            `}
                                          >
                                            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <SendHorizontal size={18} className="relative z-10 -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
                                          </button>
                                          </div>
                                        </form>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-white/50">
                                    <div className="flex items-center gap-4">
                                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLikeWallPost(w.id); }} className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors">
                                        <Heart size={14} className={w.liked ? 'fill-current text-[var(--color-accent)]' : ''} />
                                        {w.likes ?? 0}
                                      </button>
                                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWallCommentsOpenPostId(prev => prev === w.id ? null : w.id); }} className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors" title="Комментарии">
                                        <MessageSquare size={14} />
                                        {comments.length > 0 ? ` ${comments.length}` : ''}
                                      </button>
                                      <div className="relative" data-wall-share>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setWallShareOpenPostId(prev => prev === w.id ? null : w.id);
                                          }}
                                          className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors"
                                          title="Поделиться"
                                        >
                                          <Share2 size={14} />
                                        </button>
                                        {wallShareOpenPostId === w.id && (
                                          <div className="absolute left-0 bottom-full mb-2 z-[100] min-w-[180px] bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const url = `${window.location.origin}${window.location.pathname || '/'}?profile=${profileUserId}`; navigator.clipboard.writeText(url).then(() => { setToast({ message: 'Ссылка скопирована', type: 'success' }); setWallShareOpenPostId(null); }).catch(() => setToast({ message: 'Не удалось скопировать', type: 'error' })); }} className="w-full text-left px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/5 flex items-center gap-2 transition-colors">
                                              <Link size={14} /> Скопировать ссылку
                                            </button>
                                            {w.thread_id && (
                                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWallRepostPostId(w.id); setWallRepostCommentDraft(''); setWallShareOpenPostId(null); }} disabled={!user} className="w-full text-left px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/5 flex items-center gap-2 disabled:opacity-50 transition-colors">
                                                <Repeat2 size={14} /> Репостнуть на стену
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {canEditWallPost && (
                                      <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => handleStartEditWallPost(w)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Редактировать">
                                          <Pencil size={14} />
                                        </button>
                                        <button type="button" onClick={async () => { if (confirm('Удалить пост?')) { try { await api.deleteWallPost(profileUserId, w.id); setWallPosts(prev => prev.filter(p => p.id !== w.id)); setToast({ message: 'Пост удалён', type: 'success' }); } catch (err) { setToast({ message: err?.message || 'Ошибка', type: 'error' }); } } }} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400" title="Удалить">
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  </>
                                  )}
                                </div>
                              </div>
                            );})}
                          <input ref={wallEditImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                            const files = [...(e.target.files || [])];
                            const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                            if (files.length !== valid.length) setToast({ message: 'Фото до 5 МБ каждое', type: 'error' });
                            if (valid.length === 0) return;
                            Promise.all(valid.map(f => new Promise((res) => {
                              const r = new FileReader();
                              r.onload = () => res(r.result);
                              r.readAsDataURL(f);
                            }))).then(urls => setEditingWallPostDraft(prev => ({ ...prev, images: [...(prev.images || []), ...urls].slice(0, 10) })));
                            e.target.value = '';
                          }} />
                          {wallRepostPostId && (() => {
                            const repostPost = wallPosts.find(p => p.id === wallRepostPostId);
                            if (!repostPost) return null;
                            return (
                              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setWallRepostPostId(null); setWallRepostCommentDraft(''); }}>
                                <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-5 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                                  <p className="text-sm font-medium text-white mb-3">Добавить комментарий?</p>
                                  <textarea value={wallRepostCommentDraft} onChange={(e) => setWallRepostCommentDraft(e.target.value)} placeholder="Ваш комментарий к репосту (необязательно)..." className="w-full min-h-[80px] py-2 px-3 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] resize-none mb-4" />
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => { setWallRepostPostId(null); setWallRepostCommentDraft(''); }} className="px-4 py-2 text-[#8b949e] hover:text-white rounded-lg text-sm font-medium">Отмена</button>
                                    <button type="button" onClick={() => handleRepostWallPost(repostPost, wallRepostCommentDraft)} className="px-4 py-2 bg-[var(--color-accent)] text-black rounded-lg text-sm font-bold hover:opacity-90">Опубликовать</button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
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
                          <div className="py-12 text-center"><p className="text-[#888] text-sm">Нет созданных тем</p>{!selectedUser && <button onClick={() => navigate('/new')} className="mt-2 text-[var(--color-accent)] text-sm hover:underline">Создать</button>}</div>
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

        <aside className={`hidden space-y-6 ${view === 'profile' || view === 'admin' || view === 'messages' || view === 'settings' ? 'lg:hidden' : 'lg:block'}`}>
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
          {view === 'thread' && selectedThread && similarThreads.length > 0 && (
          <div className="bg-[var(--bg-widget-glass)] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <h4 className="text-[11px] font-bold tracking-[0.2em] opacity-60 uppercase">ПОХОЖИЕ ТЕМЫ</h4>
            </div>
            <div className="p-3">
              <div className="space-y-4 mt-4">
                {similarThreads.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => openThread(t)}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer"
                  >
                    <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={t.cover_image || t.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="56" viewBox="0 0 80 56"%3E%3Crect fill="%23333" width="80" height="56"/%3E%3C/svg%3E'}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h4 className="font-bold text-white text-lg leading-tight break-words line-clamp-2 overflow-hidden min-w-0 group-hover:text-[var(--color-accent)] transition-colors">
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><Heart size={10} /> {t.likes_count ?? t.likes ?? 0}</span>
                        <span>•</span>
                        <span>{t.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
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
      {lightbox.open && <ImageViewer images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox({ open: false, images: [], index: 0 })} />}

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
            <button onClick={() => setShowAuth(false)} aria-label="Закрыть окно входа" className="absolute top-4 right-4 text-[#484f58] hover:text-white transition-colors"><X size={20} /></button>

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
        <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${view === 'feed' && activeNav === 'forum' ? 'text-[var(--color-accent)]' : 'text-[#8b949e]'}`}>
          <MessageSquare size={20} />
          <span className="text-[9px] font-black uppercase">Форум</span>
        </button>
        <button
          onClick={() => navigate('/messages')}
          className={`flex flex-col items-center gap-1 ${view === 'messages' ? '' : 'text-[#8b949e]'}`}
          style={view === 'messages' ? { color: messagesConfig.color || 'var(--color-accent)' } : {}}
        >
          {React.createElement(getIconComponent(messagesConfig?.icon || 'MessageCircle'), { size: 20 })}
          <span className="text-[9px] font-black uppercase">{messagesConfig.name}</span>
        </button>
        <button onClick={() => user ? navigate('/new') : (setShowAuth(true), setAuthMode('login'))} aria-label="Создать тему" className="bg-[var(--color-accent)] text-black p-3 rounded-xl -mt-10 shadow-xl border-4 border-[#0d1117] transition-all active:scale-90">
          <PlusIcon size={24} />
        </button>
        <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-[var(--color-accent)]' : 'text-[#8b949e]'}`}>
          <User size={20} />
          <span className="text-[9px] font-black uppercase">Профиль</span>
        </button>
      </footer>
      </div>
    </div>
  );
}
