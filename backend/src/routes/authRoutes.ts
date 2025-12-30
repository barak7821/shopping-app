import Express from 'express';
import { register, checkAuth, login, sendOtp, verifyOtp, resetPassword, google } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, checkAuth) // Check if user is authenticated


// Define route handlers
router.post('/', authLimiter, register) // Register user
router.post('/login', authLimiter, login) // Login user
router.post('/otp', authLimiter, sendOtp) // Send OTP
router.post('/verifyOtp', authLimiter, verifyOtp) // Verify OTP
router.post('/resetPassword', authLimiter, resetPassword) // Reset password
router.post('/google', google) // Google login/register

export default router