const User     = require('../models/User');
const Follower = require('../models/Follower');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await require('../config/db').query(
      `SELECT id, username, full_name, avatar,
              (SELECT COUNT(*) FROM followers WHERE following_id = users.id) AS followers_count
       FROM users ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, users: rows });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, req.user?.id || null);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const fields = {};
    if (req.body.full_name) fields.full_name = req.body.full_name;
    if (req.body.bio !== undefined) fields.bio = req.body.bio;

    if (req.files) {
      if (req.files.avatar) fields.avatar = `/assets/uploads/${req.files.avatar[0].filename}`;
      if (req.files.banner) fields.banner = `/assets/uploads/${req.files.banner[0].filename}`;
    }

    await User.update(req.user.id, fields);
    const user = await User.findById(req.user.id, req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.followers = async (req, res, next) => {
  try {
    const list = await Follower.listFollowers(req.params.id);
    res.json({ success: true, followers: list });
  } catch (err) { next(err); }
};

exports.following = async (req, res, next) => {
  try {
    const list = await Follower.listFollowing(req.params.id);
    res.json({ success: true, following: list });
  } catch (err) { next(err); }
};

exports.suggestions = async (req, res, next) => {
  try {
    const list = await User.suggestions(req.user.id);
    res.json({ success: true, suggestions: list });
  } catch (err) { next(err); }
};
