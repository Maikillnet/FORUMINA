export function SimpleMarkdown({ children, emojis }) {
  const text = String(children || '');
  if (!text.trim()) return null;
  const emojiMap = (emojis || []).reduce((acc, e) => {
    if (e?.code && e?.type === 'image' && e?.value) acc[e.code.toLowerCase()] = e.value;
    return acc;
  }, {});
  const parts = text.split(/(```[\s\S]*?```)/g);
  const escapeHtml = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const renderText = (t) => {
    // Escape user content to plain text FIRST, then layer markdown-ish
    // tags on top — otherwise injected HTML (e.g. <img onerror=...>) in
    // thread content would execute via dangerouslySetInnerHTML below.
    let out = escapeHtml(t);
    out = out.replace(/:([a-zA-Z0-9_]+):/g, (match) => {
      const code = ':' + match.slice(1, -1) + ':';
      const src = emojiMap[code.toLowerCase()];
      return src ? `<img src="${src.replace(/"/g, '&quot;')}" alt="" class="inline-block w-6 h-6 align-middle mx-0.5" />` : match;
    });
    return out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };
  return (
    <div className="prose-emerald">
      {parts.map((p, i) =>
        p.startsWith('```') ? (
          <pre key={i} className="bg-[var(--bg-main)] p-4 rounded-lg border border-[#30363d] overflow-x-auto my-4">
            <code className="text-[var(--color-accent)] text-sm">{p.replace(/^```\w*\n?|```$/g, '').trim()}</code>
          </pre>
        ) : (
          <div key={i} dangerouslySetInnerHTML={{ __html: renderText(p) }} className="[&_strong]:text-[var(--color-accent)] [&_strong]:font-bold [&_code]:bg-[var(--bg-main)] [&_code]:text-[var(--color-accent)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:border [&_code]:border-[#30363d]" />
        )
      )}
    </div>
  );
}
