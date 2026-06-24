/**
 * User model — encapsulates all DB queries for the users table.
 */
const pool = require('../config/db');

const User = {
  /**
   * Find user by id. Optionally include follower/following counts.
   */
  async findById(id, requesterId = null) {
    const [rows] = await pool.query(
      `SELECT
         u.id, u.username, u.email, u.full_name, u.bio, u.avatar, u.banner, u.created_at,
         (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS followers_count,
         (SELECT COUNT(*) FROM followers WHERE follower_id  = u.id) AS following_count,
         (SELECT COUNT(*) FROM posts      WHERE user_id     = u.id) AS posts_count,
         IF(? IS NOT NULL,
            (SELECT COUNT(*) FROM followers WHERE follower_id = ? AND following_id = u.id),
            0) AS is_following
       FROM users u WHERE u.id = ?`,
      [requesterId, requesterId, id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async create({ username, email, password, full_name }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, password, full_name]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const allowed = ['full_name', 'bio', 'avatar', 'banner'];
    const sets = [];
    const vals = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) { sets.push(`${key} = ?`); vals.push(fields[key]); }
    }
    if (!sets.length) return;
    vals.push(id);
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
  },

  async search(query, limit = 20) {
    const q = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT id, username, full_name, avatar,
              (SELECT COUNT(*) FROM followers WHERE following_id = users.id) AS followers_count
       FROM users WHERE username LIKE ? OR full_name LIKE ? LIMIT ?`,
      [q, q, limit]
    );
    return rows;
  },

  async suggestions(userId, limit = 5) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar,
              (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS followers_count
       FROM users u
       WHERE u.id <> ?
         AND u.id NOT IN (SELECT following_id FROM followers WHERE follower_id = ?)
       ORDER BY RAND() LIMIT ?`,
      [userId, userId, limit]
    );
    return rows;
  }
};

module.exports = User;
