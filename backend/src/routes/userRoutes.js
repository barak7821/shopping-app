import Express from 'express';
import apicache from "apicache";
import authMiddleware from '../middlewares/authMiddleware.js';
import { changePassword, deleteUser, getUser, updateUser, verifyPassword } from '../controllers/userController.js';

const router = Express.Router()
const cache = apicache.middleware

// Caching for frequently used routes
router.get('/', authMiddleware, cache("10 minutes"), getUser)

// Routes without caching
router.patch('/', authMiddleware, updateUser)
router.delete('/', authMiddleware, deleteUser)
router.patch('/password', authMiddleware, changePassword)
router.post('/password', authMiddleware, verifyPassword)

export default router