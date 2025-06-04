import Express from 'express';
import { createOrder, createOrderForUser } from '../controllers/orderControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()

router.post('/guest', createOrder)
router.post('/', authMiddleware, createOrderForUser)

export default router