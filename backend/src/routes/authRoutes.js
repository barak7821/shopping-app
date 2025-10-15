import Express from 'express';
import { register, checkAuth, login, sendOtp, verifyOtp, resetPassword, google } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import cache from '../middlewares/cacheMiddleware.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, cache("5 minutes"), checkAuth)

// Define route handlers
router.post('/', register)
router.post('/login', login)
router.post('/otp', sendOtp)
router.post('/verifyOtp', verifyOtp)
router.post('/resetPassword', resetPassword)
router.post('/google', google)

export default router