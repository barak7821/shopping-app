import Express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { changePassword, deleteUser, getUser, updateUser, verifyPassword } from '../controllers/userController.js';
import cache from '../middlewares/cacheMiddleware.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, cache("10 minutes"), getUser)

// Define route handlers
router.patch('/', authMiddleware, updateUser)
router.delete('/', authMiddleware, deleteUser)
router.patch('/password', authMiddleware, changePassword)
router.post('/password', authMiddleware, verifyPassword)

export default router