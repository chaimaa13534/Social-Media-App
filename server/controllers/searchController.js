const User = require('../models/User');
const pool = require('../config/db');

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, users: [], posts: [] });

    const users = await User.search(q);

    const like = `%${q}%`;
    const [posts] = await pool.query(
      `SELECT p.id, p.content, p.created_at,
              u.id AS author_id, u.username, u.full_name, u.avatar,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.content LIKE ? ORDER BY p.created_at DESC LIMIT 20`,
      [like]
    );

    res.json({ success: true, users, posts });
  } catch (err) { next(err); }
};
