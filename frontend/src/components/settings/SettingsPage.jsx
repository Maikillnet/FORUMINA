import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Zap, Key, Eye, EyeOff, User, Lock } from 'lucide-react';
import * as api from '../../api';

const inputFocusClass = 'focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all';

export function SettingsPage({ user, setUser, setToast, onBack, onSaveSuccess, onMountRefresh }) {
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const userClearedKeyToEdit = useRef(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [login, setLogin] = useState(user?.username || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileVisibility, setProfileVisibility] = useState(user?.settings?.privacy?.profile_visibility || 'everyone');
  const [showOnlineStatus, setShowOnlineStatus] = useState(user?.settings?.privacy?.show_online_status !== false);
  const [messageAccess, setMessageAccess] = useState(user?.settings?.privacy?.message_access || 'all');
  const [saving, setSaving] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [passwordShake, setPasswordShake] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLogin(user?.username || '');
    setNickname(user?.nickname != null ? user.nickname : '');
    setProfileVisibility(user?.settings?.privacy?.profile_visibility || 'everyone');
    setShowOnlineStatus(user?.settings?.privacy?.show_online_status !== false);
    setMessageAccess(user?.settings?.privacy?.message_access || 'all');
  }, [user?.id, user?.username, user?.nickname, user?.settings?.privacy]);

  useEffect(() => {
    onMountRefresh?.();
  }, [onMountRefresh]);

  useEffect(() => {
    userClearedKeyToEdit.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (user?.has_openai_key && !userClearedKeyToEdit.current) {
      setOpenaiKeyInput('•••• (ключ сохранён)');
    } else if (!user?.has_openai_key && openaiKeyInput === '•••• (ключ сохранён)') {
      setOpenaiKeyInput('');
    }
  }, [user?.has_openai_key]);

  const changingLogin = login.trim().toLowerCase() !== (user?.username || '').toLowerCase();
  const changingNickname = nickname.trim() !== (user?.nickname || '');
  const changingPassword = newPassword || confirmPassword;
  const needsPassword = changingPassword || changingLogin || changingNickname;

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!user?.id) return;
    if (needsPassword && !currentPassword?.trim()) {
      setCurrentPasswordError(true);
      setPasswordShake(true);
      setTimeout(() => setPasswordShake(false), 500);
      setToast({
        message: 'Для смены логина, никнейма или пароля введите текущий пароль',
        type: 'error',
      });
      return;
    }
    setCurrentPasswordError(false);
    if (changingPassword) {
      if (newPassword !== confirmPassword) {
        setToast({ message: 'Пароли не совпадают', type: 'error' });
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        setToast({ message: 'Новый пароль минимум 8 символов', type: 'error' });
        return;
      }
    }
    const loginTrimmed = login.trim().toLowerCase();
    if (loginTrimmed && !/^[a-z0-9_]+$/.test(loginTrimmed)) {
      setToast({ message: 'Логин: только a-z, 0-9 и _', type: 'error' });
      return;
    }
    if (loginTrimmed && loginTrimmed.length < 2) {
      setToast({ message: 'Логин минимум 2 символа', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const openaiKeyValue = openaiKeyInput.trim() || undefined;
      const isNewKeyTyped = openaiKeyValue && openaiKeyValue.length > 0 && !openaiKeyValue.startsWith('•');
      if (openaiKeyValue && openaiKeyValue === loginTrimmed && !openaiKeyValue.startsWith('sk-')) {
        setToast({ message: 'Ключ AI не может совпадать с логином. Введите корректный OpenAI API ключ (начинается с sk-).', type: 'error' });
        setSaving(false);
        return;
      }
      const settingsPayload = {
        privacy: {
          profile_visibility: profileVisibility,
          show_online_status: showOnlineStatus,
          message_access: messageAccess,
        },
      };
      if (isNewKeyTyped) settingsPayload.openai_key = openaiKeyValue;
      const payload = {
        username: loginTrimmed || undefined,
        nickname: nickname.trim() || undefined,
        settings: settingsPayload,
      };
      if (needsPassword) payload.currentPassword = currentPassword;
      if (changingPassword) {
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }
      const updated = await api.saveSettings(payload);
      const keySaved = Boolean(updated?.has_openai_key ?? !!openaiKeyValue);
      setUser((prev) => prev ? { ...prev, ...updated, has_openai_key: keySaved } : prev);
      userClearedKeyToEdit.current = false;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      setToast({ message: 'Настройки успешно сохранены', type: 'success' });
      onSaveSuccess?.();
      setOpenaiKeyInput('');
    } catch (err) {
      const msg = err?.message || 'Ошибка сохранения';
      setToast({ message: msg, type: 'error' });
      if (msg.includes('пароль') || msg.includes('Старый пароль') || msg.includes('неверный')) {
        setCurrentPasswordError(true);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <p className="text-gray-400">Войдите для доступа к настройкам</p>
        <button onClick={onBack} className="mt-4 text-[var(--color-accent)] hover:underline text-sm">Назад</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[11px] text-[#484f58] font-bold uppercase tracking-wider">
        <button onClick={onBack} className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          Назад
        </button>
        <ChevronRight size={12} />
        <span className="text-[var(--color-accent)]">Настройки</span>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        <div className="p-6 md:p-8 space-y-8">
          {/* Интеграции */}
          <section>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[var(--color-accent)]" />
              Интеграции
            </h3>
            <div className="space-y-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                Этот ключ используется для работы вашего персонального AI-ассистента в чатах.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKeyInput}
                    onChange={(e) => setOpenaiKeyInput(e.target.value)}
                    onFocus={() => {
                      if (openaiKeyInput === '•••• (ключ сохранён)') {
                        userClearedKeyToEdit.current = true;
                        setOpenaiKeyInput('');
                      }
                    }}
                    onBlur={() => {
                      if (openaiKeyInput === '' && user?.has_openai_key) {
                        userClearedKeyToEdit.current = false;
                        setOpenaiKeyInput('•••• (ключ сохранён)');
                      }
                    }}
                    placeholder={user?.has_openai_key ? '•••• (ключ сохранён)' : 'OpenAI API Key'}
                    autoComplete="new-password"
                    className={`w-full pl-9 pr-10 py-3 text-sm bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-gray-500 ${inputFocusClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors rounded"
                    title={showOpenaiKey ? 'Скрыть' : 'Показать'}
                  >
                    {showOpenaiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !openaiKeyInput?.trim() || openaiKeyInput === '•••• (ключ сохранён)'}
                  className="px-4 py-3 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {saving ? '...' : 'Сохранить ключ'}
                </button>
              </div>
            </div>
          </section>

          {/* Аккаунт */}
          <section>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={16} className="text-[var(--color-accent)]" />
              Аккаунт
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Логин (ID для входа)</label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="Только a-z, 0-9, _"
                  autoComplete="off"
                  className={`w-full px-4 py-3 text-sm bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-gray-500 ${inputFocusClass}`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Отображаемое имя (Никнейм)</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Например: Никита"
                  className={`w-full px-4 py-3 text-sm bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-gray-500 ${inputFocusClass}`}
                />
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Смена пароля</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Текущий пароль {needsPassword && <span className="text-red-400">*</span>}
                      {!needsPassword && <span className="text-gray-500 font-normal normal-case"> (только при смене логина, никнейма или пароля)</span>}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (currentPasswordError) setCurrentPasswordError(false);
                      }}
                      placeholder="Текущий пароль"
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 text-sm bg-black/30 rounded-lg text-white placeholder:text-gray-500 ${inputFocusClass} ${currentPasswordError ? 'border-2 border-red-500/60 ring-2 ring-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : 'border border-white/10'} ${passwordShake ? 'animate-shake' : ''}`}
                    />
                    {currentPasswordError && (
                      <p className="mt-1.5 text-xs text-red-400">Введите текущий пароль для подтверждения изменений</p>
                    )}
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Новый пароль"
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 text-sm bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-gray-500 ${inputFocusClass}`}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите новый пароль"
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 text-sm bg-black/30 border rounded-lg text-white placeholder:text-gray-500 ${inputFocusClass} ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500/60 ring-2 ring-red-500/20' : 'border-white/10'}`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Приватность */}
          <section>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock size={16} className="text-[var(--color-accent)]" />
              Приватность
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Видимость профиля</label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className={`w-full px-4 py-3 text-sm bg-black/30 border border-white/10 rounded-lg text-white ${inputFocusClass}`}
                >
                  <option value="everyone">Видят все</option>
                  <option value="friends">Только подписчики</option>
                  <option value="nobody">Скрытый профиль</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <label className="text-sm text-gray-300">Показывать, когда я в сети</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showOnlineStatus}
                  onClick={() => setShowOnlineStatus((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${showOnlineStatus ? 'bg-[var(--color-accent)]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showOnlineStatus ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Кто может писать мне в ЛС</label>
                <select
                  value={messageAccess}
                  onChange={(e) => setMessageAccess(e.target.value)}
                  className={`w-full px-4 py-3 text-sm bg-black/30 border border-white/10 rounded-lg text-white ${inputFocusClass}`}
                >
                  <option value="all">Все</option>
                  <option value="friends">Только друзья</option>
                  <option value="none">Никто</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 md:px-8 py-4 border-t border-white/5 bg-black/20">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (newPassword && confirmPassword && newPassword !== confirmPassword)}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${savedSuccess ? 'bg-emerald-500 text-white' : 'bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent)]/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {saving ? 'Сохранение...' : savedSuccess ? 'Сохранено!' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
}
