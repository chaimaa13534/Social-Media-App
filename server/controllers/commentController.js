const Comment      = require('../models/Comment');
const Post         = require('../models/Post');
const Notification = require('../models/Notification');

exports.getByPost = async (req, res, next) => {
  try {
    const comments = await Comment.byPost(req.params.postId);
    res.json({ success: true, comments });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { post_id, content } = req.body;
    if (!post_id || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'post_id and content are required' });
    }
    const post = await Post.findById(post_id, req.user.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const id      = await Comment.create(post_id, req.user.id, content.trim());
    const comment = await Comment.findById(id);

    // Notify post author
    await Notification.create(post.author_id || post.user_id, req.user.id, 'comment', post_id);

    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Content required' });

    await Comment.update(req.params.id, content.trim());
    res.json({ success: true, message: 'Updated' });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    await Comment.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
