const pool = require('../config/db');

const Notification = {
  async create(userId, fromUser, type, postId = null) {
    if (userId === fromUser) return; // don't self-notify
    await pool.query(
      'INSERT INTO notifications (user_id, from_user, type, post_id) VALUES (?, ?, ?, ?)',
      [userId, fromUser, type, postId]
    );
  },

  async list(userId, limit = 30) {
    const [rows] = await pool.query(
      `SELECT n.id, n.type, n.is_read, n.created_at, n.post_id,
              u.id AS from_id, u.username AS from_username, u.full_name AS from_name, u.avatar AS from_avatar
       FROM notifications n JOIN users u ON u.id = n.from_user
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC LIMIT ?`,
      [userId, limit]
    );
    return rows;
  },

  async markAllRead(userId) {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  },

  async unreadCount(userId) {
    const [[{ c }]] = await pool.query(
      'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0', [userId]
    );
    return c;
  }
};

module.exports = Notification;
