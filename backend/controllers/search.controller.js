import db from '../db.js';

export function search(req, res) {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  const posts = db.search.byTitleOrContent(q);
  res.json(posts);
}
