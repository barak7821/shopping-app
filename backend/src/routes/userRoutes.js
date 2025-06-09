import Express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { deleteUser, getUser, updateUser } from '../controllers/userController.js';

const router = Express.Router()

router.get('/', authMiddleware, getUser)
router.patch('/', authMiddleware, updateUser)
router.delete('/', authMiddleware, deleteUser)

export default router