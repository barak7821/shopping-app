import Express from 'express';
import { createOrder, createOrderForUser, getOrdersById } from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import cache from '../middlewares/cacheMiddleware.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, cache("10 minutes"), getOrdersById)

// Define route handlers
router.post('/guest', createOrder)
router.post('/', authMiddleware, createOrderForUser)

export default router