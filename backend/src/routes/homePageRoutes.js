import Express from 'express';
import { getHeroSection, getBestSellers } from '../controllers/homePageController.js';

const router = Express.Router()

// Define route handlers
router.get('/', getHeroSection)
router.get('/bestSellers', getBestSellers)

export default router