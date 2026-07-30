import { useState, useEffect, useCallback, useRef } from 'react';
import { Wand2, PanelRight, X, FileText, Download, Pin, Trash2, Video, Paperclip, Smile, SendHorizontal, MessageSquare } from 'lucide-react';
import * as api from '../../api';
import { AvatarWithFallback } from '../ui/AvatarWithFallback';
import { ContentWithEmojis } from '../forum/ContentWithEmojis';
import { UnifiedEmojiPicker } from '../forum/UnifiedEmojiPicker';
import { SharedContentSidebar } from '../forum/SharedContentSidebar';
import { AIAssistantPanel } from './AIAssistantPanel';
import { isOnline, getChatUserStatus } from '../../utils/user';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export function MessagesPage({ user, activeChatUser, conversations, chatHistory, loading, onSelectContact, onSend, onDeleteMessage, onTogglePin, onUnpin, setToast, getAvatarUrl, openLightbox, emojis, onOpenProfile, onOpenSettings }) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('Медиа');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sharedAttachments, setSharedAttachments] = useState({ media: [], files: [], links: [] });
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const lastAiTriggerRef = useRef(null);
  const historyRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToMessage = useCallback((messageId) => {
    const el = historyRef.current?.querySelector(`[data-message-id="${messageId}"]`);
    if (el) {
      el.classList.add('message-highlight');
      setTimeout(() => el.classList.remove('message-highlight'), 2000);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {
    const pinned = chatHistory.find((m) => m.is_pinned);
    setPinnedMessage(pinned || null);
  }, [activeChatUser?.id, chatHistory]);

  const handlePin = useCallback((message) => {
    setPinnedMessage(message);
    onTogglePin?.(message.id)?.catch?.((err) => {
      setPinnedMessage(null);
      setToast?.({ message: err?.message || 'Ошибка закрепления', type: 'error' });
    });
  }, [onTogglePin, setToast]);

  const handleUnpin = useCallback(() => {
    const prev = pinnedMessage;
    setPinnedMessage(null);
    if (!prev?.id || !onUnpin) return;
    onUnpin(prev.id).catch(() => {
      setPinnedMessage(prev);
      setToast?.({ message: 'Ошибка открепления', type: 'error' });
    });
  }, [pinnedMessage, onUnpin, setToast]);
  useEffect(() => { historyRef.current?.scrollTo(0, historyRef.current.scrollHeight); }, [chatHistory]);

  useEffect(() => {
    if (!user?.id || !activeChatUser?.id) {
      setSharedAttachments({ media: [], files: [], links: [] });
      return;
    }
    api.getAttachments(user.id, activeChatUser.id)
      .then(setSharedAttachments)
      .catch(() => setSharedAttachments({ media: [], files: [], links: [] }));
  }, [user?.id, activeChatUser?.id, chatHistory.length]);

  const fetchAISuggest = useCallback(async () => {
    if (!user?.id || !activeChatUser?.id) return;
    setAiLoading(true);
    setAiAnalysis('');
    setAiDraft('');
    try {
      const data = await api.getAISuggest(user.id, activeChatUser.id);
      setAiAnalysis(data.analysis || '');
      setAiDraft(data.draft || '');
    } catch (err) {
      setAiAnalysis('Ошибка: ' + (err?.message || 'Не удалось получить ответ от AI'));
      setAiDraft('');
    } finally {
      setAiLoading(false);
    }
  }, [user?.id, activeChatUser?.id]);

  useEffect(() => {
    if (!user?.id || !activeChatUser?.id || !user?.has_openai_key) {
      setAiAnalysis('');
      setAiDraft('');
      lastAiTriggerRef.current = null;
      return;
    }
    const last = chatHistory[chatHistory.length - 1];
    if (!last || last.isMine) return;
    if (lastAiTriggerRef.current === last.id) return;
    lastAiTriggerRef.current = last.id;
    fetchAISuggest();
  }, [user?.id, activeChatUser?.id, user?.has_openai_key, chatHistory, fetchAISuggest]);

  const handleApplyDraft = useCallback((draft) => {
    if (draft) setInput(draft);
  }, []);

  const handleSendDraft = useCallback((draft) => {
    if (!draft?.trim() || !onSend) return;
    onSend(draft.trim());
    setInput('');
    setAiDraft('');
    setAiAnalysis('');
  }, [onSend]);

  useEffect(() => {
    if (!activeChatUser?.id) lastAiTriggerRef.current = null;
  }, [activeChatUser?.id]);

  useEffect(() => {
    const h = (e) => { if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setEmojiPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = [...(e.target.files || [])];
    const valid = files.filter((f) => f.size <= MAX_ATTACHMENT_SIZE);
    if (files.length !== valid.length) setToast?.({ message: 'Файл до 10 МБ', type: 'error' });
    if (valid.length === 0) return;
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
        setAttachments((prev) => [...prev, { type, url: reader.result, name: file.name, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [setToast]);

  const removeAttachment = (i) => setAttachments((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || !user || !activeChatUser) return;
    const att = attachments.map((a) => ({ type: a.type, url: a.url, name: a.name, size: a.size }));
    onSend(input.trim(), att);
    setInput('');
    setAttachments([]);
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
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 backdrop-blur-md bg-black/20 sticky top-0 z-10 flex-shrink-0">
                <div className="relative flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-black/40 shadow-lg shadow-purple-500/10 shrink-0">
                    <AvatarWithFallback src={getAvatarUrl(activeChatUser)} alt={activeChatUser.username} fallbackLetter={activeChatUser.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white truncate block">{activeChatUser.username}</span>
                    <span className={`text-[10px] flex items-center gap-1 ${status.isOnline ? 'text-emerald-400/90' : 'text-orange-400/90'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAIPanel((v) => !v)}
                    className={`p-2 rounded-lg transition-colors ${showAIPanel ? 'bg-white/10 text-[var(--color-accent)]' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                    title={showAIPanel ? 'Скрыть AI' : 'AI Ассистент'}
                  >
                    <Wand2 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSidebar((v) => !v)}
                    className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-white/10 text-[var(--color-accent)]' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                    title={showSidebar ? 'Скрыть вложения' : 'Вложения'}
                  >
                    <PanelRight size={20} />
                  </button>
                </div>
              </div>
              {/* Messages area with depth */}
              <div ref={historyRef} className="flex-1 overflow-y-auto flex flex-col relative overflow-x-hidden">
                <div
                  className={`sticky top-0 z-20 shrink-0 transition-all duration-300 transform overflow-hidden ${
                    pinnedMessage ? 'translate-y-0 opacity-100 max-h-24' : '-translate-y-full opacity-0 max-h-0'
                  }`}
                >
                {pinnedMessage && (
                  <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 p-3 flex items-center gap-3">
                    <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full shrink-0" />
                    <div
                      className="flex-1 min-w-0 flex items-center justify-between gap-2 cursor-pointer"
                      onClick={() => scrollToMessage(pinnedMessage.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest">Закреплённое сообщение</p>
                        <p className="text-sm text-gray-300 line-clamp-1 truncate">{pinnedMessage.content || (pinnedMessage.attachments?.length ? '📎 Файл' : '')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleUnpin();
                        }}
                        className="p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
                </div>
                <div className="flex-1 p-4 space-y-4">
                {loading && chatHistory.length === 0 ? (
                  <div className="text-white/60 text-sm">Загрузка...</div>
                ) : !loading && chatHistory.length === 0 ? (
                  <div className="text-white/60 text-sm">Нет сообщений. Напишите первым!</div>
                ) : (
                  chatHistory.map((m) => (
                    <div key={m.id} data-message-id={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'} group/message`}>
                      <div className={`max-w-[70%] px-4 py-2.5 text-sm rounded-2xl shadow-lg relative ${m.isMine ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm shadow-purple-500/20' : 'bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-tl-sm'}`}>
                        {m.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {m.attachments.map((a, i) => (
                              a.type === 'image' ? (
                                <div key={i} className="rounded-lg overflow-hidden cursor-zoom-in" onClick={() => { const imgs = m.attachments.filter((x) => x.type === 'image').map((x) => x.url); const idx = m.attachments.slice(0, i).filter((x) => x.type === 'image').length; openLightbox?.(imgs, idx); }}>
                                  <img src={a.url} alt="" className="max-w-[200px] max-h-[150px] object-cover rounded-lg" />
                                </div>
                              ) : a.type === 'video' ? (
                                <video key={i} src={a.url} controls className="max-w-xs max-h-40 rounded-lg" />
                              ) : (
                                <a key={i} href={a.url} download={a.name} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                                  <FileText size={16} />
                                  <span className="truncate max-w-[120px]">{a.name}</span>
                                  <Download size={14} />
                                </a>
                              )
                            ))}
                          </div>
                        )}
                        {m.content && <p className="break-words whitespace-pre-wrap"><ContentWithEmojis text={m.content} emojis={emojis} /></p>}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className={`text-[10px] ${m.isMine ? 'text-white/80' : 'text-white/50'}`}>{m.time}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
                            {(m.isMine || user?.is_admin) && onTogglePin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  m.is_pinned ? handleUnpin() : handlePin(m);
                                }}
                                className={`p-1 rounded hover:bg-white/20 transition-colors ${m.is_pinned ? 'text-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]'}`}
                                title={m.is_pinned ? 'Открепить' : 'Закрепить'}
                              >
                                <Pin size={12} className={m.is_pinned ? 'fill-current' : ''} />
                              </button>
                            )}
                            {(m.isMine || user?.is_admin) && onDeleteMessage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Удалить сообщение?')) onDeleteMessage(m.id);
                                }}
                                className="p-1 rounded hover:bg-white/20 hover:text-red-500 transition-colors"
                                title="Удалить сообщение"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>
              {/* Floating glass input */}
              {user ? (
                <div className="m-4 flex-shrink-0">
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-white/5 border border-white/5">
                      {attachments.map((a, i) => (
                        <div key={i} className="relative flex items-center gap-2">
                          {a.type === 'image' ? (
                            <div className="w-14 h-14 rounded-lg overflow-hidden">
                              <img src={a.url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : a.type === 'video' ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                              <Video size={16} className="text-[var(--color-accent)]" />
                              <span className="text-xs truncate max-w-[100px]">{a.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                              <FileText size={16} className="text-[var(--color-accent)]" />
                              <span className="text-xs truncate max-w-[100px]">{a.name}</span>
                            </div>
                          )}
                          <button type="button" onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.zip" multiple className="hidden" onChange={handleFileSelect} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all flex-shrink-0" title="Прикрепить файл"><Paperclip size={18} /></button>
                    <div className="relative flex-shrink-0" ref={emojiPickerRef}>
                      <button type="button" onClick={() => setEmojiPickerOpen((v) => !v)} className="p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all" title="Эмодзи"><Smile size={18} /></button>
                      <UnifiedEmojiPicker emojis={emojis} open={emojiPickerOpen} onClose={() => setEmojiPickerOpen(false)} onSelect={(insert) => setInput((prev) => prev + insert)} />
                    </div>
                    <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 min-w-0 bg-transparent border-none px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0" placeholder="Написать сообщение..." />
                    <button
                      type="submit"
                      disabled={!input.trim() && attachments.length === 0}
                      className={`
                        relative group flex items-center justify-center
                        p-3 sm:p-3.5 rounded-full text-white
                        bg-gradient-to-br from-[var(--color-accent)] to-indigo-600
                        shadow-lg shadow-[var(--color-accent)]/30
                        hover:shadow-[var(--color-accent)]/50 hover:scale-105 hover:brightness-110
                        active:scale-95
                        disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 disabled:brightness-100
                        transition-all duration-300 ease-out flex-shrink-0
                      `}
                    >
                      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <SendHorizontal size={20} className="relative z-10 -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
                    </button>
                  </form>
                </div>
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
        {showSidebar && activeChatUser && (
          <SharedContentSidebar
            media={sharedAttachments.media}
            files={sharedAttachments.files}
            links={sharedAttachments.links}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            searchQuery={sidebarSearch}
            onSearchChange={setSidebarSearch}
            onClose={() => setShowSidebar(false)}
            scrollToMessage={scrollToMessage}
          />
        )}
        {showAIPanel && user && (
          <AIAssistantPanel
            user={user}
            activeChatUser={activeChatUser}
            aiAnalysis={aiAnalysis}
            aiDraft={aiDraft}
            aiLoading={aiLoading}
            onApplyDraft={handleApplyDraft}
            onRegenerate={fetchAISuggest}
            onSendDraft={handleSendDraft}
            onClose={() => setShowAIPanel(false)}
            onOpenProfile={onOpenProfile}
            onOpenSettings={onOpenSettings}
          />
        )}
      </div>
    </div>
  );
}
