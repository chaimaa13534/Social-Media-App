const router = require('express').Router();
const auth   = require('../controllers/authController');
const guard  = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login',    auth.login);
router.get('/me',        guard, auth.me);

module.exports = router;
