import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

export function ProfileBanner({ coverUrl, isOwnProfile, onCoverChange }) {
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
