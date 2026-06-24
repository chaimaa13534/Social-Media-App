const pool = require('../config/db');

exports.stats = async (req, res, next) => {
  try {
    const [[users]]    = await pool.query('SELECT COUNT(*) AS c FROM users');
    const [[posts]]    = await pool.query('SELECT COUNT(*) AS c FROM posts');
    const [[comments]] = await pool.query('SELECT COUNT(*) AS c FROM comments');
    const [[follows]]  = await pool.query('SELECT COUNT(*) AS c FROM followers');

    const [topUsers] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar,
              COUNT(f.id) AS followers_count
       FROM users u LEFT JOIN followers f ON f.following_id = u.id
       GROUP BY u.id ORDER BY followers_count DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        users:    users.c,
        posts:    posts.c,
        comments: comments.c,
        follows:  follows.c
      },
      topUsers
    });
  } catch (err) { next(err); }
};
