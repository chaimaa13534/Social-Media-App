/**
 * Post model — all DB queries for the posts table.
 */
const pool = require('../config/db');

const Post = {
  /** List posts for the feed (all or from followed users), newest first, paginated. */
  async feed({ userId, followingOnly = false, page = 1, limit = 15 }) {
    const offset = (page - 1) * limit;
    let where = '';
    const params = [userId, userId];

    if (followingOnly) {
      where = 'AND p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)';
      params.unshift(userId);
    }

    const [rows] = await pool.query(
      `SELECT
         p.id, p.content, p.image, p.created_at,
         u.id AS author_id, u.username, u.full_name, u.avatar,
         (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS likes_count,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
         (SELECT COUNT(*) FROM likes    WHERE post_id = p.id AND user_id = ?) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE 1=1 ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return rows;
  },

  /** Posts by a specific user */
  async byUser(userId, requesterId, page = 1, limit = 15) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT
         p.id, p.content, p.image, p.created_at,
         u.id AS author_id, u.username, u.full_name, u.avatar,
         (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS likes_count,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
         (SELECT COUNT(*) FROM likes    WHERE post_id = p.id AND user_id = ?) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [requesterId, userId, limit, offset]
    );
    return rows;
  },

  async findById(id, requesterId) {
    const [rows] = await pool.query(
      `SELECT
         p.id, p.content, p.image, p.created_at, p.user_id,
         u.username, u.full_name, u.avatar,
         (SELECT COUNT(*) FROM likes    WHERE post_id = p.id) AS likes_count,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
         (SELECT COUNT(*) FROM likes    WHERE post_id = p.id AND user_id = ?) AS liked_by_me
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
      [requesterId, id]
    );
    return rows[0] || null;
  },

  async create(userId, content, image = null) {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)',
      [userId, content, image]
    );
    return result.insertId;
  },

  async update(id, content, image = null) {
    if (image) {
      await pool.query('UPDATE posts SET content = ?, image = ? WHERE id = ?', [content, image, id]);
    } else {
      await pool.query('UPDATE posts SET content = ? WHERE id = ?', [content, id]);
    }
  },

  async delete(id) {
    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
  },

  /** Trending: posts with most likes in the last 24 h */
  async trending(limit = 5) {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, u.username, u.full_name, u.avatar,
              COUNT(l.id) AS likes_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN likes l ON l.post_id = p.id
       WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
       GROUP BY p.id
       ORDER BY likes_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

module.exports = Post;
