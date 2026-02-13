const API = '/api';

function getToken() {
  return localStorage.getItem('forum_token');
}

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

const SERVER_ERROR = 'Сервер недоступен. Запустите backend (дважды кликни backend\\start-backend.bat).';

async function safeJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(SERVER_ERROR);
  }
}

async function safeFetch(url, opts = {}) {
  try {
    return await fetch(url, opts);
  } catch (e) {
    throw new Error(SERVER_ERROR);
  }
}

export async function login(login, password) {
  const res = await safeFetch(`${API}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ login, password }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка входа');
  return data;
}

export async function register(username, email, password) {
  const res = await safeFetch(`${API}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, email, password }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка регистрации');
  return data;
}

export async function getMe() {
  const res = await safeFetch(`${API}/auth/me`, { headers: headers() });
  if (res.status === 401) return null;
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function getActivityFeed() {
  const res = await safeFetch(`${API}/users/me/feed`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function getCategories() {
  const res = await safeFetch(`${API}/categories`, { headers: headers() });
  if (!res.ok) throw new Error('Ошибка загрузки категорий');
  return safeJson(res);
}

export async function createCategory(data) {
  const res = await safeFetch(`${API}/categories`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await safeJson(res);
  if (!res.ok) throw new Error(out?.error || 'Ошибка создания категории');
  return out;
}

export async function updateCategory(id, data) {
  const res = await safeFetch(`${API}/categories/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await safeJson(res);
  if (!res.ok) throw new Error(out?.error || 'Ошибка обновления категории');
  return out;
}

export async function deleteCategory(id) {
  const res = await safeFetch(`${API}/categories/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const out = await safeJson(res);
  if (!res.ok) throw new Error(out?.error || 'Ошибка удаления категории');
  return out;
}

export async function getPosts(category = 'all', filter = 'new') {
  const params = new URLSearchParams({ category, filter });
  const res = await safeFetch(`${API}/posts?${params}`, { headers: headers() });
  if (!res.ok) throw new Error('Ошибка загрузки тем');
  return safeJson(res);
}

export async function getPost(id) {
  const res = await safeFetch(`${API}/posts/${id}`, { headers: headers() });
  if (!res.ok) throw new Error('Тема не найдена');
  return safeJson(res);
}

export async function getComments(postId) {
  const res = await safeFetch(`${API}/posts/${postId}/comments`, { headers: headers() });
  if (!res.ok) throw new Error('Ошибка загрузки комментариев');
  return safeJson(res);
}

export async function createPost(title, content, category, tags = '', images = []) {
  const res = await safeFetch(`${API}/posts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title, content, category, tags, images }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка публикации');
  return data;
}

export async function votePost(postId, vote) {
  const res = await safeFetch(`${API}/posts/${postId}/vote`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ vote }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка голосования');
  return data;
}

export async function likePost(postId) {
  const res = await safeFetch(`${API}/posts/${postId}/like`, {
    method: 'POST',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка лайка');
  return data;
}

export async function addComment(postId, content, images = [], parentId = null) {
  const res = await safeFetch(`${API}/posts/${postId}/comments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content, images, parentId }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка публикации');
  return data;
}

export async function search(q) {
  const res = await safeFetch(`${API}/search?q=${encodeURIComponent(q)}`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function getUserProfile(userId) {
  const res = await safeFetch(`${API}/users/${userId}`, { headers: headers() });
  if (!res.ok) throw new Error('Пользователь не найден');
  return safeJson(res);
}

export async function getSubscriptions(userId) {
  const res = await safeFetch(`${API}/users/${userId}/subscriptions`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function getFollowers(userId) {
  const res = await safeFetch(`${API}/users/${userId}/followers`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function toggleFollow(userId) {
  const res = await safeFetch(`${API}/users/${userId}/follow`, {
    method: 'POST',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function getPostsByAuthor(userId) {
  const res = await safeFetch(`${API}/users/${userId}/posts`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function getChatMessages() {
  const res = await safeFetch(`${API}/chat`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function sendChatMessage(content) {
  const res = await safeFetch(`${API}/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function getConversations(userId) {
  const res = await safeFetch(`${API}/messages/conversations/${userId}?t=${Date.now()}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function getChatHistory(userId, contactId) {
  const res = await safeFetch(`${API}/messages/history/${userId}/${contactId}`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function sendPrivateMessage(senderId, receiverId, content) {
  const res = await safeFetch(`${API}/messages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ senderId, receiverId, content: content.trim() }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка отправки');
  return data;
}

export async function updateProfile({ username, avatar, cover, gender, occupation, interests }) {
  const body = {};
  if (username != null) body.username = username;
  if (avatar !== undefined) body.avatar = avatar;
  if (cover !== undefined) body.cover = cover;
  if (gender != null) body.gender = gender;
  if (occupation != null) body.occupation = occupation;
  if (interests != null) body.interests = interests;
  const res = await safeFetch(`${API}/users/me`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка обновления');
  return data;
}

export async function getWall(userId) {
  const res = await safeFetch(`${API}/wall/${userId}`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function postWall(userId, content, threadId = null, threadTitle = null, images = [], pollQuestion = null, pollOptions = null) {
  const res = await safeFetch(`${API}/wall/${userId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content: content || '', thread_id: threadId, thread_title: threadTitle, images: images || [], poll_question: pollQuestion || null, poll_options: pollOptions || null }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function voteWallPoll(userId, postId, optionIndex) {
  const res = await safeFetch(`${API}/wall/${userId}/vote/${postId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ option_index: optionIndex }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function likeWallPost(userId, postId) {
  const res = await safeFetch(`${API}/wall/${userId}/like/${postId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({}),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function addWallComment(userId, postId, content) {
  const res = await safeFetch(`${API}/wall/${userId}/comment/${postId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ content: content || '' }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function getStats() {
  const res = await safeFetch(`${API}/stats`, { headers: headers() });
  if (!res.ok) return { posts: 0, users: 0, real_users: 0, display_users: 0, real_messages: 0, display_messages: 0 };
  try {
    const data = await safeJson(res);
    return { ...data, display_users: data.display_users ?? data.users, display_messages: data.display_messages ?? data.real_messages ?? 0 };
  } catch {
    return { posts: 0, users: 0, real_users: 0, display_users: 0, real_messages: 0, display_messages: 0 };
  }
}

export async function getLatestComments() {
  const res = await safeFetch(`${API}/stats/latest-comments`);
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function likeComment(postId, commentId) {
  const res = await safeFetch(`${API}/posts/${postId}/comments/${commentId}/like`, {
    method: 'POST',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function setUserRank(userId, rank) {
  const res = await safeFetch(`${API}/users/${userId}/rank`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ rank }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка');
  return data;
}

export async function getAdminUsers() {
  const res = await safeFetch(`${API}/admin/users`, { headers: headers() });
  if (!res.ok) throw new Error((await safeJson(res))?.error || 'Ошибка загрузки');
  return safeJson(res);
}

export async function getTrophies() {
  const res = await safeFetch(`${API}/admin/trophies`, { headers: headers() });
  if (!res.ok) throw new Error((await safeJson(res))?.error || 'Ошибка загрузки трофеев');
  return safeJson(res);
}

export async function createTrophy(name, description, image) {
  const res = await safeFetch(`${API}/admin/trophies`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, description, image }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка создания трофея');
  return data;
}

export async function deleteTrophy(id) {
  const res = await safeFetch(`${API}/admin/trophies/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка удаления');
  return data;
}

export async function assignTrophyToUser(userId, trophyId) {
  const res = await safeFetch(`${API}/admin/users/${userId}/trophies`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ trophyId }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка выдачи трофея');
  return data;
}

export async function revokeTrophyFromUser(userId, trophyId) {
  const res = await safeFetch(`${API}/admin/users/${userId}/trophies/${trophyId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка отзыва трофея');
  return data;
}

export async function getUserTrophies(userId) {
  const res = await safeFetch(`${API}/users/${userId}/trophies`, { headers: headers() });
  if (!res.ok) return [];
  try {
    return await safeJson(res);
  } catch {
    return [];
  }
}

export async function getSiteSettings() {
  const res = await safeFetch(`${API}/site-settings`);
  if (!res.ok) return { site_name: 'FORUM.LIVE', site_logo: '', site_pattern: '', theme: { bg_main: '#0d1117', bg_block: '#161b22', text_primary: '#ffffff', color_accent: '#10b981' } };
  try {
    const data = await safeJson(res);
    return { ...data, site_pattern: data.site_pattern || '', theme: data.theme || null };
  } catch {
    return { site_name: 'FORUM.LIVE', site_logo: '', site_pattern: '', theme: { bg_main: '#0d1117', bg_block: '#161b22', text_primary: '#ffffff', color_accent: '#10b981' } };
  }
}

export async function getAdminSettings() {
  const res = await safeFetch(`${API}/admin/settings`, { headers: headers() });
  if (!res.ok) throw new Error((await safeJson(res))?.error || 'Ошибка загрузки настроек');
  return safeJson(res);
}

export async function updateAdminSetting(key, value) {
  const res = await safeFetch(`${API}/admin/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ key, value }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка сохранения');
  return data;
}

export async function updateAdminSettings(payload) {
  const res = await safeFetch(`${API}/admin/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка сохранения');
  return data;
}

export async function recalculateReputation() {
  const res = await safeFetch(`${API}/admin/recalculate-reputation`, {
    method: 'POST',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка пересчёта');
  return data;
}

export async function getAdminPosts(page = 1, perPage = 20) {
  const res = await safeFetch(`${API}/admin/posts?page=${page}&perPage=${perPage}`, { headers: headers() });
  if (!res.ok) throw new Error((await safeJson(res))?.error || 'Ошибка загрузки постов');
  return safeJson(res);
}

export async function deleteAdminPost(id) {
  const res = await safeFetch(`${API}/admin/posts/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.error || 'Ошибка удаления');
  return data;
}
