const router = require('express').Router();
const ctrl   = require('../controllers/postController');
const guard  = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/trending',        guard, ctrl.trending);
router.get('/user/:userId',    guard, ctrl.getByUser);
router.get('/',                guard, ctrl.feed);
router.get('/:id',             guard, ctrl.getOne);
router.post('/',   guard, upload.single('image'), ctrl.create);
router.put('/:id', guard, upload.single('image'), ctrl.update);
router.delete('/:id',          guard, ctrl.delete);

module.exports = router;
