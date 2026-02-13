import db from '../db.js';

function requireAdmin(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Только администратор может управлять настройками' });
  return null;
}

export function getAll(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const settings = db.system_settings.getAll();
  res.json(settings);
}

const DEFAULT_THEME = { bg_main: '#0d1117', bg_block: '#161b22', text_primary: '#ffffff', color_accent: '#10b981', bg_widget: '#13131f', widget_opacity: 0.7, block_opacity: 0.8, bg_profile: '#1a0b2e', profile_opacity: 0.8 };

/** Public endpoint for site branding (header, tab title, theme) */
export function getSiteSettings(req, res) {
  const site_name = db.system_settings.get('site_name') || 'FORUM.LIVE';
  const site_logo = db.system_settings.get('site_logo') || '';
  const site_pattern = db.system_settings.get('site_pattern') || '';
  let theme = DEFAULT_THEME;
  try {
    const raw = db.system_settings.get('theme');
    if (raw) theme = { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch { }
  res.json({ site_name, site_logo, site_pattern, theme });
}

export function update(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const { key, value, site_name, site_logo, site_pattern, bonus_users, bonus_messages, reputation_per_thread, theme } = req.body;

  if (site_name !== undefined || site_logo !== undefined || site_pattern !== undefined || bonus_users !== undefined || bonus_messages !== undefined || reputation_per_thread !== undefined || theme !== undefined) {
    if (typeof site_name === 'string') db.system_settings.set('site_name', site_name.trim() || 'FORUM.LIVE');
    if (typeof site_logo === 'string') db.system_settings.set('site_logo', site_logo);
    if (site_pattern !== undefined) db.system_settings.set('site_pattern', typeof site_pattern === 'string' ? site_pattern : '');
    if (bonus_users !== undefined) {
      const n = parseInt(bonus_users, 10);
      db.system_settings.set('bonus_users', isNaN(n) || n < 0 ? 0 : n);
    }
    if (bonus_messages !== undefined) {
      const n = parseInt(bonus_messages, 10);
      db.system_settings.set('bonus_messages', isNaN(n) || n < 0 ? 0 : n);
    }
    if (reputation_per_thread !== undefined) {
      const num = parseInt(reputation_per_thread, 10);
      if (isNaN(num) || num < 0) return res.status(400).json({ error: 'Репутация должна быть неотрицательным числом' });
      db.system_settings.set('reputation_per_thread', num);
    }
    if (theme && typeof theme === 'object') {
      const { bg_main, bg_block, text_primary, color_accent, bg_widget, widget_opacity, block_opacity, bg_profile, profile_opacity } = theme;
      const valid = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v);
      const t = {};
      if (valid(bg_main)) t.bg_main = bg_main;
      if (valid(bg_block)) t.bg_block = bg_block;
      if (valid(text_primary)) t.text_primary = text_primary;
      if (valid(color_accent)) t.color_accent = color_accent;
      if (valid(bg_widget)) t.bg_widget = bg_widget;
      if (typeof widget_opacity === 'number' && widget_opacity >= 0 && widget_opacity <= 1) t.widget_opacity = widget_opacity;
      if (typeof block_opacity === 'number' && block_opacity >= 0 && block_opacity <= 1) t.block_opacity = block_opacity;
      if (valid(bg_profile)) t.bg_profile = bg_profile;
      if (typeof profile_opacity === 'number' && profile_opacity >= 0 && profile_opacity <= 1) t.profile_opacity = profile_opacity;
      if (Object.keys(t).length) {
        const stored = db.system_settings.get('theme');
        let merged = DEFAULT_THEME;
        try { if (stored) merged = { ...DEFAULT_THEME, ...JSON.parse(stored) }; } catch { }
        db.system_settings.set('theme', JSON.stringify({ ...merged, ...t }));
      }
    }
    return res.json({ success: true });
  }

  if (!key || value === undefined) return res.status(400).json({ error: 'Укажите key и value' });
  const num = parseInt(value, 10);
  if (key === 'reputation_per_thread' && (isNaN(num) || num < 0)) {
    return res.status(400).json({ error: 'Репутация должна быть неотрицательным числом' });
  }
  db.system_settings.set(key, value);
  res.json({ success: true, key, value: String(value) });
}

export function recalculateReputation(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  try {
    const usersUpdated = db.users.recalculateReputation();
    res.json({ success: true, usersUpdated });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Ошибка пересчёта репутации' });
  }
}
