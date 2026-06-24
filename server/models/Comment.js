const pool = require('../config/db');

const Comment = {
  async byPost(postId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.content, c.created_at, c.user_id,
              u.username, u.full_name, u.avatar
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(postId, userId, content) {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );
    return result.insertId;
  },

  async update(id, content) {
    await pool.query('UPDATE comments SET content = ? WHERE id = ?', [content, id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
  }
};

module.exports = Comment;
