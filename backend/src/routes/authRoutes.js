import Express from 'express';
import { register, checkAuth, login } from '../controllers/authControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()

router.post('/', register)
router.post('/login', login)
router.get('/', authMiddleware, checkAuth)

export default router