const pool = require('../config/db');

const Like = {
  async toggle(postId, userId) {
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]
    );
    if (existing.length) {
      await pool.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      return { liked: false };
    } else {
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      return { liked: true };
    }
  },

  async count(postId) {
    const [[{ c }]] = await pool.query(
      'SELECT COUNT(*) AS c FROM likes WHERE post_id = ?', [postId]
    );
    return c;
  }
};

module.exports = Like;
