import Express from 'express';
import apicache from "apicache";
import { createOrder, createOrderForUser, getOrdersById } from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()
const cache = apicache.middleware

// Caching for frequently used routes
router.get('/', authMiddleware, cache("10 minutes"), getOrdersById)

// Routes without caching
router.post('/guest', createOrder)
router.post('/', authMiddleware, createOrderForUser)

export default router