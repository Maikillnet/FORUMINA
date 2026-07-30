import { useState, useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import * as api from '../../api';
import { AvatarWithFallback } from '../ui/AvatarWithFallback';
import { getAvatarUrl } from '../../utils/user';

export function ProfileEditModal({ user, onClose, onSave }) {
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
        <button onClick={onClose} aria-label="Закрыть окно редактирования профиля" className="absolute top-4 right-4 text-[#484f58] hover:text-white"><X size={20} /></button>
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
