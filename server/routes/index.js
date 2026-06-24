const router = require('express').Router();
const guard  = require('../middleware/auth');

router.use('/auth',          require('./auth'));
router.use('/users',         require('./users'));
router.use('/posts',         require('./posts'));
router.use('/comments',      require('./comments'));

// Likes
router.post('/likes',  guard, require('../controllers/likeController').toggle);

// Follow
router.post('/follow', guard, require('../controllers/followController').toggle);

// Search
router.get('/search',  guard, require('../controllers/searchController').search);

// Dashboard
router.get('/dashboard/stats', guard, require('../controllers/dashboardController').stats);

// Notifications
const notifCtrl = require('../controllers/notificationController');
router.get('/notifications',           guard, notifCtrl.list);
router.get('/notifications/unread',    guard, notifCtrl.unreadCount);
router.put('/notifications/mark-read', guard, notifCtrl.markRead);

module.exports = router;
