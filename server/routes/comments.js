const router = require('express').Router();
const ctrl   = require('../controllers/commentController');
const guard  = require('../middleware/auth');

router.get('/:postId',  guard, ctrl.getByPost);
router.post('/',        guard, ctrl.create);
router.put('/:id',      guard, ctrl.update);
router.delete('/:id',   guard, ctrl.delete);

module.exports = router;
