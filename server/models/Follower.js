const pool = require('../config/db');

const Follower = {
  async toggle(followerId, followingId) {
    if (followerId === followingId) throw Object.assign(new Error("Can't follow yourself"), { status: 400 });
    const [existing] = await pool.query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]
    );
    if (existing.length) {
      await pool.query('DELETE FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
      return { following: false };
    } else {
      await pool.query('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
      return { following: true };
    }
  },

  async listFollowers(userId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar
       FROM followers f JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ? ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async listFollowing(userId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar
       FROM followers f JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = ? ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  }
};

module.exports = Follower;
