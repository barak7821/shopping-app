import Express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { changePassword, deleteUser, getUser, updateUser, verifyPassword } from '../controllers/userController.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, getUser) // Get logged-in user

// Define route handlers
router.patch('/', authMiddleware, updateUser) // Update user
router.delete('/', authMiddleware, deleteUser) // Delete user
router.patch('/password', authMiddleware, changePassword) // Change password
router.post('/password', authMiddleware, verifyPassword) // Verify password

export default router
