const Post         = require('../models/Post');
const Notification = require('../models/Notification');

exports.feed = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 15;
    const follow = req.query.following === 'true';
    const posts  = await Post.feed({ userId: req.user.id, followingOnly: follow, page, limit });
    res.json({ success: true, posts, page, hasMore: posts.length === limit });
  } catch (err) { next(err); }
};

exports.getByUser = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 15;
    const posts = await Post.byUser(req.params.userId, req.user.id, page, limit);
    res.json({ success: true, posts, page, hasMore: posts.length === limit });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id, req.user.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Content too long (max 1000 chars)' });
    }
    const image = req.file ? `/assets/uploads/${req.file.filename}` : null;
    const id    = await Post.create(req.user.id, content.trim(), image);
    const post  = await Post.findById(id, req.user.id);
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id, req.user.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Content required' });

    const image = req.file ? `/assets/uploads/${req.file.filename}` : undefined;
    await Post.update(req.params.id, content.trim(), image);
    const updated = await Post.findById(req.params.id, req.user.id);
    res.json({ success: true, post: updated });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id, req.user.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    await Post.delete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

exports.trending = async (req, res, next) => {
  try {
    const posts = await Post.trending(5);
    res.json({ success: true, posts });
  } catch (err) { next(err); }
};
