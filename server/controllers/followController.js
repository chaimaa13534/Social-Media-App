const Follower     = require('../models/Follower');
const Notification = require('../models/Notification');

exports.toggle = async (req, res, next) => {
  try {
    const { following_id } = req.body;
    if (!following_id) return res.status(400).json({ success: false, message: 'following_id required' });

    const result = await Follower.toggle(req.user.id, parseInt(following_id));

    if (result.following) {
      await Notification.create(parseInt(following_id), req.user.id, 'follow');
    }

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
