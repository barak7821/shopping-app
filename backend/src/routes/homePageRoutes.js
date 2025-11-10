import Express from 'express';
import { getHeroSection, getBestSellers, getContactInfoSection } from '../controllers/homePageController.js';

const router = Express.Router()

// Define route handlers
router.get('/', getHeroSection) // Get hero section
router.get('/bestSellers', getBestSellers) // Get best sellers section
router.get('/contactInfo', getContactInfoSection) // Get contact info section

export default router