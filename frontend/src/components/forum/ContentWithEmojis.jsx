export function ContentWithEmojis({ text, emojis, className }) {
  if (!text) return null;
  const emojiMap = (emojis || []).reduce((acc, e) => {
    if (e.code) acc[e.code.toLowerCase()] = e;
    return acc;
  }, {});
  const parts = String(text).split(/(:[a-zA-Z0-9_]+:)/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith(':') && p.endsWith(':')) {
          const e = emojiMap[p.toLowerCase()];
          if (e?.type === 'image' && e?.value) {
            return <img key={i} src={e.value} alt="" className="inline-block w-6 h-6 align-middle mx-0.5" />;
          }
        }
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}
