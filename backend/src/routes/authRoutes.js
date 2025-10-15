import Express from 'express';
import { register, checkAuth, login, sendOtp, verifyOtp, resetPassword, google } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Express.Router()

router.post('/', register)
router.post('/login', login)
router.get('/', authMiddleware, checkAuth)
router.post('/otp', sendOtp)
router.post('/verifyOtp', verifyOtp)
router.post('/resetPassword', resetPassword)
router.post('/google', google)

export default router