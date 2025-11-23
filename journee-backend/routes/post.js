const express = require('express');
const { postController } = require('../controllers/post');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.patch('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

router.post('/:id/react', postController.reactPost);
router.post('/:id/comment', postController.commentOnPost);

module.exports = router;
