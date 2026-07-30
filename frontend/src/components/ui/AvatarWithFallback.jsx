import { useState } from 'react';

export const AvatarWithFallback = ({ src, alt, fallbackLetter, className = '' }) => {
  const [errored, setErrored] = useState(false);
  const displaySrc = errored || !src ? null : src;
  const letter = (fallbackLetter || alt || '?').charAt(0).toUpperCase();
  return displaySrc ? (
    <img src={displaySrc} alt={alt || ''} className={className} onError={() => setErrored(true)} />
  ) : (
    <div className={`${className} bg-slate-600 flex items-center justify-center text-white font-bold`} style={{ fontSize: '0.65em' }}>{letter}</div>
  );
};
