import Express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getUser } from '../controllers/userControllers.js';

const router = Express.Router()

router.get('/', authMiddleware, getUser)

export default router