const router  = require('express').Router();
const ctrl    = require('../controllers/userController');
const guard   = require('../middleware/auth');
const upload  = require('../middleware/upload');

router.get('/suggestions',   guard, ctrl.suggestions);
router.get('/',              guard, ctrl.getAll);
router.get('/:id',           guard, ctrl.getById);
router.put('/:id', guard, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), ctrl.update);
router.get('/:id/followers', guard, ctrl.followers);
router.get('/:id/following', guard, ctrl.following);

module.exports = router;
