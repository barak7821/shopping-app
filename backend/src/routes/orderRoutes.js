import Express from 'express';
import { createOrder, createOrderForUser, getOrdersById } from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()

router.post('/guest', createOrder)
router.post('/', authMiddleware, createOrderForUser)
router.get('/', authMiddleware, getOrdersById)

export default router