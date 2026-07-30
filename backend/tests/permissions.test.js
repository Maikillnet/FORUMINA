import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { app } from '../app.js';
import { initDb } from '../db.js';

process.env.DB_PATH = join(tmpdir(), `forum-test-permissions-${process.pid}-${Date.now()}.json`);

let adminToken;
let userToken;
let otherUserToken;

beforeAll(async () => {
  await initDb();

  const admin = await request(app)
    .post('/api/auth/login')
    .send({ login: 'admin_dev', password: 'admin123' });
  adminToken = admin.body.token;

  const user = await request(app)
    .post('/api/auth/register')
    .send({ username: 'alice', email: 'alice@example.com', password: 'longenough' });
  userToken = user.body.token;

  const other = await request(app)
    .post('/api/auth/register')
    .send({ username: 'bob', email: 'bob@example.com', password: 'longenough' });
  otherUserToken = other.body.token;
});

describe('admin-only routes', () => {
  it('reject an unauthenticated request', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('reject a logged-in but non-admin user', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test' });
    expect(res.status).toBe(403);
  });

  it('allow an admin', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'QA Category' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
  });

  it('reject a non-admin from the admin post-management list', async () => {
    const res = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('allow an admin to list posts for moderation', async () => {
    const res = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});

describe('requireAdmin middleware coverage (emojis, trophies, settings)', () => {
  it('blocks a non-admin from creating an emoji, allows an admin', async () => {
    const denied = await request(app)
      .post('/api/emojis')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'unicode', value: '🚀', name: 'rocket' });
    expect(denied.status).toBe(403);

    const allowed = await request(app)
      .post('/api/emojis')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'unicode', value: '🚀', name: 'rocket' });
    expect(allowed.status).toBe(201);
  });

  it('blocks a non-admin from creating a trophy, allows an admin', async () => {
    const denied = await request(app)
      .post('/api/admin/trophies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'QA Trophy' });
    expect(denied.status).toBe(403);

    const allowed = await request(app)
      .post('/api/admin/trophies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'QA Trophy' });
    expect(allowed.status).toBe(201);
  });

  it('blocks a non-admin from reading or writing admin settings, allows an admin', async () => {
    const deniedGet = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(deniedGet.status).toBe(403);

    const deniedPut = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ site_name: 'Hijacked' });
    expect(deniedPut.status).toBe(403);

    const allowed = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rules_content: 'Updated rules' });
    expect(allowed.status).toBe(200);

    const publicSettings = await request(app).get('/api/site-settings');
    expect(publicSettings.body.rules_content).toBe('Updated rules');
  });
});

describe('post authorship', () => {
  let postId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Alice thread', content: 'hello', category: 'Backend' });
    postId = res.body.id;
  });

  it('lets the author edit their own post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Alice thread (edited)' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Alice thread (edited)');
  });

  it("blocks a different, non-admin user from editing someone else's post", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ title: 'hijacked' });
    expect(res.status).toBe(403);
  });

  it("blocks a different, non-admin user from deleting someone else's post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.status).toBe(403);
  });

  it('lets an admin delete a post they did not author', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/posts/${postId}`);
    expect(check.status).toBe(404);
  });
});
