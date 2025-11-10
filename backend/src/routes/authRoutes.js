import Express from 'express';
import { register, checkAuth, login, sendOtp, verifyOtp, resetPassword, google } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', authMiddleware, checkAuth) // Check if user is authenticated


// Define route handlers
router.post('/', register) // Register user
router.post('/login', login) // Login user
router.post('/otp', sendOtp) // Send OTP
router.post('/verifyOtp', verifyOtp) // Verify OTP
router.post('/resetPassword', resetPassword) // Reset password
router.post('/google', google) // Google login/register

export default router