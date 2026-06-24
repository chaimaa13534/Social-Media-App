const Notification = require('../models/Notification');

exports.list = async (req, res, next) => {
  try {
    const notifications = await Notification.list(req.user.id);
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const count = await Notification.unreadCount(req.user.id);
    res.json({ success: true, count });
  } catch (err) { next(err); }
};
