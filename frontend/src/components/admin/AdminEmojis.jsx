import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import * as api from '../../api';

export function AdminEmojis({ emojis, loadEmojis, setToast }) {
  const [emojiTab, setEmojiTab] = useState('unicode');
  const [unicodeValue, setUnicodeValue] = useState('');
  const [unicodeName, setUnicodeName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imageCode, setImageCode] = useState('');
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);

  const handleAddUnicode = async (e) => {
    e.preventDefault();
    if (!unicodeValue.trim() || !unicodeName.trim()) {
      setToast({ message: 'Введите эмодзи и название', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.createEmoji({ type: 'unicode', value: unicodeValue.trim(), name: unicodeName.trim(), code: `:${unicodeName.trim().replace(/\s+/g, '_')}:` });
      setToast({ message: 'Смайл добавлен', type: 'success' });
      setUnicodeValue('');
      setUnicodeName('');
      loadEmojis?.();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imagePreview || !imageName.trim()) {
      setToast({ message: 'Загрузите изображение и укажите код', type: 'error' });
      return;
    }
    const code = imageCode.trim() || `:${imageName.trim().replace(/\s+/g, '_')}:`;
    const finalCode = code.startsWith(':') ? code : `:${code}`;
    const finalCode2 = finalCode.endsWith(':') ? finalCode : `${finalCode}:`;
    setLoading(true);
    try {
      await api.createEmoji({ type: 'image', value: imagePreview, name: imageName.trim(), code: finalCode2 });
      setToast({ message: 'Смайл добавлен', type: 'success' });
      setImagePreview(null);
      setImageName('');
      setImageCode('');
      loadEmojis?.();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmoji = async (id) => {
    try {
      await api.deleteEmoji(id);
      setToast({ message: 'Смайл удалён', type: 'success' });
      loadEmojis?.();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка', type: 'error' });
    }
  };

  const handleImageFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) {
      setToast({ message: 'Только изображения', type: 'error' });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setToast({ message: 'Файл до 2 МБ', type: 'error' });
      return;
    }
    const r = new FileReader();
    r.onload = () => { setImagePreview(r.result); };
    r.readAsDataURL(f);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 pb-4 border-b border-[#30363d]">
        <button onClick={() => setEmojiTab('unicode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${emojiTab === 'unicode' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>Unicode</button>
        <button onClick={() => setEmojiTab('image')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${emojiTab === 'image' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-[#8b949e] hover:text-white'}`}>Изображение</button>
      </div>
      {emojiTab === 'unicode' && (
        <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-black text-white mb-4">Добавить Unicode смайл</h3>
          <form onSubmit={handleAddUnicode} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Эмодзи (вставьте символ)</label>
              <input value={unicodeValue} onChange={(e) => setUnicodeValue(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-3 text-2xl focus:outline-none focus:border-[var(--color-accent)]" placeholder="😀" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Название (для кода :name:)</label>
              <input value={unicodeName} onChange={(e) => setUnicodeName(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="smile" />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">Добавить</button>
          </form>
        </div>
      )}
      {emojiTab === 'image' && (
        <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6">
          <h3 className="text-lg font-black text-white mb-4">Добавить кастомный смайл</h3>
          <form onSubmit={handleAddImage} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Изображение</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 py-2 bg-[var(--bg-main)] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white hover:border-[var(--color-accent)]/50 transition-colors">
                  {imagePreview ? 'Изменить' : 'Загрузить'}
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                {imagePreview && <img src={imagePreview} alt="" className="w-12 h-12 rounded-lg object-cover border border-[#30363d]" />}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Название</label>
              <input value={imageName} onChange={(e) => setImageName(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder="pepe_dance" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8b949e] uppercase block mb-2">Код (опционально, по умолчанию :name:)</label>
              <input value={imageCode} onChange={(e) => setImageCode(e.target.value)} className="w-full bg-[var(--bg-main)] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-accent)]" placeholder=":pepe_dance:" />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-[var(--color-accent)] text-black rounded-lg font-bold text-sm hover:bg-[color:var(--color-accent)]/90 disabled:opacity-50">Добавить</button>
          </form>
        </div>
      )}
      <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl p-6">
        <h3 className="text-lg font-black text-white mb-4">Все смайлы</h3>
        {emojis.length === 0 ? (
          <p className="text-[#8b949e] text-sm">Нет смайлов. Добавьте первый.</p>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-3">
            {emojis.map((e) => (
              <div key={e.id} className="p-2 bg-[var(--bg-main)] rounded-lg border border-[#30363d] flex flex-col items-center gap-1 relative group">
                {e.type === 'unicode' ? (
                  <span className="text-2xl">{e.value}</span>
                ) : (
                  <img src={e.value} alt="" className="w-8 h-8 object-contain" />
                )}
                <span className="text-[10px] text-[#8b949e] truncate max-w-full">{e.code}</span>
                <button type="button" onClick={() => handleDeleteEmoji(e.id)} className="absolute top-1 right-1 p-1 text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
