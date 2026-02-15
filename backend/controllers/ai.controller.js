/**
 * AI Assistant controller - suggests replies based on chat context.
 * Uses OpenAI API (set OPENAI_API_KEY env var) or returns a fallback when no key.
 */
import db from '../db.js';

function requireAuth(req, res) {
  if (!req.user) {
    res.status(401).json({ error: 'Войдите для использования AI' });
    return false;
  }
  return true;
}

function buildContext(messages, contactUsername, ownerUsername) {
  const recent = messages.slice(-10);
  return recent.map((m) => {
    const role = m.isMine ? 'owner' : 'contact';
    const name = m.isMine ? ownerUsername : contactUsername;
    let text = m.content || '';
    if (m.attachments?.length) {
      const attDesc = m.attachments.map((a) => {
        if (a.type === 'image') return '[Изображение]';
        if (a.type === 'video') return '[Видео]';
        return `[Файл: ${a.name || 'документ'}]`;
      }).join(' ');
      text = text ? `${text} ${attDesc}` : attDesc;
    }
    return { role, name, text };
  });
}

export async function suggest(req, res) {
  if (!requireAuth(req, res)) return;
  const { userId, contactId } = req.body;
  if (!userId || !contactId) {
    return res.status(400).json({ error: 'Укажите userId и contactId' });
  }
  const uid = parseInt(userId, 10);
  const cid = parseInt(contactId, 10);
  if (uid !== req.user.id) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  const messages = db.private_messages.getConversation(uid, cid);
  const enriched = messages.map((m) => ({ ...m, isMine: m.senderId === uid }));
  const contact = db.users.getById(cid);
  const owner = db.users.getById(uid);
  const contactUsername = contact?.nickname || contact?.username || 'Собеседник';
  const ownerUsername = owner?.nickname || owner?.username || 'Вы';

  const context = buildContext(enriched, contactUsername, ownerUsername);
  const lastFromContact = [...enriched].reverse().find((m) => !m.isMine);
  if (!lastFromContact && context.length === 0) {
    return res.json({ analysis: 'Нет сообщений для анализа.', draft: '' });
  }

  const ownerUser = db.users.getById(uid);
  const apiKey = ownerUser?.settings?.openai_key || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'Ключ не найден. Добавьте его в настройках',
      analysis: '',
      draft: '',
    });
  }

  const contextStr = context
    .map((c) => `${c.name}: ${c.text}`)
    .join('\n');

  const systemPrompt = `Ты — помощник владельца чата. На основе контекста переписки и вложений напиши краткий, дружелюбный и профессиональный черновик ответа. Ответ должен быть готов к отправке, но ждёт одобрения пользователя. Пиши на том же языке, что и переписка. Не добавляй пояснений вроде "Вот черновик:" — только сам текст ответа.`;
  const userPrompt = `Контекст чата с ${contactUsername}:\n\n${contextStr}\n\nНапиши черновик ответа от имени владельца чата.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      let errMsg = 'Ошибка AI-сервиса';
      try {
        const errJson = JSON.parse(errBody);
        const detail = errJson?.error?.message || errJson?.error?.code || errJson?.message;
        if (detail) errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      } catch {
        if (errBody) errMsg = errBody.slice(0, 200);
      }
      console.error('OpenAI API error:', response.status, errMsg);
      return res.status(502).json({
        error: errMsg,
        analysis: '',
        draft: '',
      });
    }

    const data = await response.json();
    const draft = data.choices?.[0]?.message?.content?.trim() || '';

    const fileInfo = lastFromContact?.attachments?.length
      ? ` Вложения: ${lastFromContact.attachments.map((a) => a.name || a.type).join(', ')}.`
      : '';
    const analysis = `Пользователь ${contactUsername} отправил сообщение.${fileInfo} GPT подготовил черновик ответа.`;

    return res.json({ analysis, draft });
  } catch (err) {
    console.error('AI suggest error:', err);
    return res.status(500).json({
      error: err.message || 'Ошибка AI',
      analysis: 'Не удалось обработать запрос.',
      draft: '',
    });
  }
}
