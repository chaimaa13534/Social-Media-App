const Like         = require('../models/Like');
const Post         = require('../models/Post');
const Notification = require('../models/Notification');

exports.toggle = async (req, res, next) => {
  try {
    const { post_id } = req.body;
    if (!post_id) return res.status(400).json({ success: false, message: 'post_id required' });

    const post = await Post.findById(post_id, req.user.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const result = await Like.toggle(post_id, req.user.id);
    const count  = await Like.count(post_id);

    if (result.liked) {
      await Notification.create(post.author_id || post.user_id, req.user.id, 'like', post_id);
    }

    res.json({ success: true, ...result, likes_count: count });
  } catch (err) { next(err); }
};
