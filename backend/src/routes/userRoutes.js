import Express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { changePassword, deleteUser, getUser, updateUser, verifyPassword } from '../controllers/userController.js';

const router = Express.Router()

router.get('/', authMiddleware, getUser)
router.patch('/', authMiddleware, updateUser)
router.delete('/', authMiddleware, deleteUser)
router.patch('/password', authMiddleware, changePassword)
router.post('/password', authMiddleware, verifyPassword)

export default router