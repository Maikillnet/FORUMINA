/**
 * Sanitize user object before sending to client.
 * - Removes password
 * - Adds has_openai_key flag (never expose the actual key)
 * - Deletes openai_key from settings
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  safe.has_openai_key = !!(user.settings?.openai_key);
  if (safe.settings?.openai_key) {
    delete safe.settings.openai_key;
  }
  return safe;
}
