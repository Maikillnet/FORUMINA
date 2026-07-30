import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import * as api from '../../api';

export function AdminMessages({ setToast }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadPosts = useCallback(() => {
    setLoading(true);
    api.getAdminPosts(page, perPage)
      .then(({ items: list, total: t }) => {
        setItems(list || []);
        setTotal(t || 0);
      })
      .catch(() => setToast({ message: 'Ошибка загрузки постов', type: 'error' }))
      .finally(() => setLoading(false));
  }, [page, perPage, setToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.deleteAdminPost(id);
      setToast({ message: 'Пост удалён', type: 'success' });
      loadPosts();
    } catch (err) {
      setToast({ message: err?.message || 'Ошибка удаления', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / perPage) || 1;

  return (
    <div className="bg-[var(--bg-block)] border border-[#30363d] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#30363d]">
        <h3 className="text-lg font-black text-white">Сообщения (посты)</h3>
        <p className="text-[11px] text-[#8b949e] mt-1">Просмотр и модерация всех тем форума</p>
      </div>
      {loading ? (
        <div className="p-8 text-center text-[#8b949e] text-sm">Загрузка...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-left text-[#8b949e]">
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Автор</th>
                  <th className="p-4 font-bold">Тема</th>
                  <th className="p-4 font-bold">Превью</th>
                  <th className="p-4 font-bold">Дата</th>
                  <th className="p-4 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                    <td className="p-4 font-mono text-[#8b949e]">{p.id}</td>
                    <td className="p-4 font-medium text-white">{p.author || '—'}</td>
                    <td className="p-4 text-white max-w-[200px] truncate">{p.title || '—'}</td>
                    <td className="p-4 text-[#8b949e] max-w-[240px] truncate">{p.content_preview || (p.content || '').substring(0, 80) + '…'}</td>
                    <td className="p-4 text-[#8b949e]">{p.time || '—'}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <div className="p-8 text-center text-[#8b949e] text-sm">Нет постов</div>
          )}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
              <span className="text-[#8b949e] text-sm">Всего: {total}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 bg-[var(--bg-main)] border border-[#30363d] rounded text-sm text-white disabled:opacity-50 hover:border-[var(--color-accent)]/50"
                >
                  ← Назад
                </button>
                <span className="px-3 py-1.5 text-[#8b949e] text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 bg-[var(--bg-main)] border border-[#30363d] rounded text-sm text-white disabled:opacity-50 hover:border-[var(--color-accent)]/50"
                >
                  Вперёд →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
