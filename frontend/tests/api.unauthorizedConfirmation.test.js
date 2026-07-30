import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// A single X-Token-Invalid header on a response can be a transport-level
// fluke (observed with the Vite dev proxy misreporting headers under a
// burst of concurrent requests, not a real backend signal — see api.js
// for the full story). These tests lock in that a lone flagged response
// does NOT log the user out, while a confirmed-invalid token still does.

function makeResponse({ status = 200, xTokenInvalid = null } = {}) {
  const headers = new Map();
  if (xTokenInvalid) headers.set('X-Token-Invalid', xTokenInvalid);
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (k) => headers.get(k) ?? null },
    text: async () => '[]',
    json: async () => [],
  };
}

describe('api.js unauthorized-token confirmation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not log out on a single flagged response among many valid ones', async () => {
    localStorage.setItem('forum_token', 'valid-token');
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      // The "real" call is flagged (the flaky burst artifact); the
      // follow-up confirmation call to /auth/me comes back clean.
      if (String(url).includes('/auth/me')) return makeResponse({ status: 200 });
      return makeResponse({ status: 200, xTokenInvalid: '1' });
    }));

    const api = await import('../src/api.js');
    const handler = vi.fn();
    api.onUnauthorized(handler);

    await api.getCategories();

    // Let the fire-and-forget confirmation microtask/promise chain settle.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(localStorage.getItem('forum_token')).toBe('valid-token');
    expect(handler).not.toHaveBeenCalled();
  });

  it('logs out when the confirmation call also reports the token as invalid', async () => {
    localStorage.setItem('forum_token', 'dead-token');
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).includes('/auth/me')) return makeResponse({ status: 401, xTokenInvalid: '1' });
      return makeResponse({ status: 200, xTokenInvalid: '1' });
    }));

    const api = await import('../src/api.js');
    const handler = vi.fn();
    api.onUnauthorized(handler);

    await api.getSiteSettings();

    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(localStorage.getItem('forum_token')).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
