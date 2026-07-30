import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Trophy, Settings, Users, List, MessageSquare, Smile, Plus, Palette, Pencil, Trash2, Folder } from 'lucide-react';
import * as api from '../../api';
import { AvatarWithFallback } from '../ui/AvatarWithFallback';
import { AdminMessages } from './AdminMessages';
import { AdminEmojis } from './AdminEmojis';
import { LUCIDE_ICONS } from '../../constants/icons';

export function AdminPanel({ adminTab, setAdminTab, adminTrophies, setAdminTrophies, adminUsers, grantTrophyTarget, setGrantTrophyTarget, setToast, setView, getAvatarUrl, categories, loadCategories, refreshSiteSettings, onPreviewPattern, emojis, loadEmojis }) {
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
  const [rulesContent, setRulesContent] = useState('');
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
    if (adminTab !== 'settings') return;
    const hexToRgba = (hex, alpha) => {
      const h = (hex || '#13131f').replace('#', '');
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${Number.isNaN(r) ? 19 : r}, ${Number.isNaN(g) ? 19 : g}, ${Number.isNaN(b) ? 31 : b}, ${alpha})`;
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
  }, [adminTab, themeSettings.bg_widget, themeSettings.widget_opacity, themeSettings.bg_block, themeSettings.block_opacity, themeSettings.bg_profile, themeSettings.profile_opacity]);

  useEffect(() => {
    if (adminTab !== 'settings') return;
    // Unsaved live-preview values are only meant to apply while this tab is
    // open — re-fetch the real saved theme on leave/unmount so App's own
    // effect re-applies it, instead of leaving the custom properties blank.
    return () => {
      refreshSiteSettings?.();
    };
  }, [adminTab, refreshSiteSettings]);

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
          const rules = list.find((x) => x.key === 'rules_content');
          setRulesContent(rules?.value || '');
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
        rules_content: rulesContent,
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
      await api.recalculateReputation();
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
        <button onClick={() => setAdminTab('emojis')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === 'emojis' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>
          <Smile size={14} className="inline mr-2" /> Смайлы
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
                <h4 className="text-sm font-black text-white mb-3">Правила сообщества</h4>
                <textarea
                  value={rulesContent}
                  onChange={(e) => setRulesContent(e.target.value)}
                  rows={10}
                  maxLength={20000}
                  className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)] resize-y"
                  placeholder="Текст страницы «Правила». Поддерживается **жирный**, `код` и блоки ```кода```."
                />
                <p className="text-[11px] text-[#8b949e] mt-1">Отображается на странице «Правила». Поддерживает **жирный текст**, `код` и блоки кода.</p>
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

      {adminTab === 'emojis' && <AdminEmojis emojis={emojis || []} loadEmojis={loadEmojis} setToast={setToast} />}

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
