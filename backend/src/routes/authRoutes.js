import Express from 'express';
import apicache from "apicache";
import { register, checkAuth, login, sendOtp, verifyOtp, resetPassword, google } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()
const cache = apicache.middleware

// Caching for frequently used routes
router.get('/', authMiddleware, cache("10 minutes"), checkAuth)

// Routes without caching
router.post('/', register)
router.post('/login', login)
router.post('/otp', sendOtp)
router.post('/verifyOtp', verifyOtp)
router.post('/resetPassword', resetPassword)
router.post('/google', google)

export default router