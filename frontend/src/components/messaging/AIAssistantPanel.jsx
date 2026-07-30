import { X, Key, RefreshCw, SendHorizontal, Wand2 } from 'lucide-react';

export function AIAssistantPanel({ user, aiAnalysis, aiDraft, aiLoading, onApplyDraft, onRegenerate, onSendDraft, onClose, onOpenProfile, onOpenSettings }) {
  const hasKey = user?.has_openai_key;
  return (
    <aside className="w-80 border-l border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl flex flex-col animate-slideLeft shrink-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Wand2 size={16} className="text-[var(--color-accent)]" />
          AI Ассистент
        </h3>
        <button type="button" onClick={onClose} aria-label="Закрыть AI-ассистента" className="p-1 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin-purple min-h-0">
        {!hasKey ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Key size={40} className="text-[var(--color-accent)]/50 mb-4" />
            <p className="text-sm text-gray-400 leading-relaxed">
              Пожалуйста, добавьте ваш OpenAI API Key в настройках, чтобы активировать ассистента.
            </p>
            <button
              type="button"
              onClick={() => { onClose?.(); (onOpenSettings || onOpenProfile)?.(); }}
              className="mt-4 text-xs text-[var(--color-accent)] hover:underline"
            >
              Перейти в настройки →
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-[200px] space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Анализ контекста</p>
              {aiLoading ? (
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  GPT думает...
                </p>
              ) : (
                <p className="text-xs text-gray-300">{aiAnalysis || 'Выберите чат. AI проанализирует последние сообщения и предложит ответ.'}</p>
              )}
            </div>
            <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/5 min-h-[80px]">
              <p className="text-[10px] text-gray-500 mb-2 uppercase">Черновик ответа:</p>
              <textarea
                readOnly
                value={aiDraft || ''}
                className="w-full h-24 sm:h-32 bg-transparent border-none text-sm text-gray-200 resize-none focus:outline-none placeholder:text-gray-600"
                placeholder={aiLoading ? '...' : 'Черновик появится после анализа'}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onApplyDraft?.(aiDraft)}
                disabled={!aiDraft || aiLoading}
                className="bg-[var(--color-accent)] text-white text-xs py-2 rounded-md font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-1.5"
              >
                Вставить в поле ввода
              </button>
              <button
                type="button"
                onClick={() => onRegenerate?.()}
                disabled={aiLoading}
                className="bg-white/10 text-white text-xs py-2 rounded-md font-bold hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                Перегенерировать
              </button>
              <button
                type="button"
                onClick={() => onSendDraft?.(aiDraft)}
                disabled={!aiDraft || aiLoading}
                className="col-span-2 bg-indigo-500/80 text-white text-xs py-2 rounded-md font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                <SendHorizontal size={12} />
                Отправить сразу
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
