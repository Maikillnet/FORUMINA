import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { app } from '../app.js';
import { initDb } from '../db.js';

process.env.DB_PATH = join(tmpdir(), `forum-test-auth-${process.pid}-${Date.now()}.json`);

beforeAll(async () => {
  await initDb();
});

describe('POST /api/auth/register', () => {
  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'shortpw', email: 'shortpw@example.com', password: '1234567' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 символов/);
  });

  it('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bademail', email: 'not-an-email', password: 'longenough' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newbie', email: 'newbie@example.com', password: 'longenough' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe('newbie');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects a duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newbie', email: 'someone-else@example.com', password: 'longenough' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/занят/);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in the seeded admin account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'admin_dev', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.is_admin).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'admin_dev', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });
});

describe('session validity', () => {
  it('accepts a freshly issued token on /api/auth/me', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ login: 'admin_dev', password: 'admin123' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('admin_dev');
  });

  it('flags a malformed/garbage token as invalid instead of silently ignoring it', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this.is.garbage');
    expect(res.status).toBe(401);
    expect(res.headers['x-token-invalid']).toBe('1');
  });

  it('does not flag a request with no token at all (anonymous browsing stays anonymous)', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.headers['x-token-invalid']).toBeUndefined();
  });
});

// Keep this LAST in the file: it deliberately exhausts the shared
// login/register rate limit for this app instance.
describe('rate limiting', () => {
  it('blocks further login/register attempts after the limit is hit', async () => {
    const attempts = [];
    for (let i = 0; i < 15; i++) {
      attempts.push(
        request(app)
          .post('/api/auth/login')
          .send({ login: 'admin_dev', password: 'nope' })
          .then((r) => r.status)
      );
    }
    const statuses = await Promise.all(attempts);
    expect(statuses).toContain(429);
  });
});
