import Express from 'express';
import { createOrder, createOrderForUser, getOrderById, getOrdersByQuery } from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { orderCreateLimiter } from '../middlewares/rateLimiter.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, getOrdersByQuery) // Get orders by ID

// Define route handlers
router.get('/:id', authMiddleware, getOrderById) // Get orders by ID
router.post('/guest', orderCreateLimiter, createOrder) // Create order for guest users
router.post('/', orderCreateLimiter, authMiddleware, createOrderForUser) // Create order for authenticated users

export default router