import Express from 'express';
import { getHeroSection, getBestSellers, getContactInfoSection } from '../controllers/homePageController.js';

const router = Express.Router()

// Define route handlers
router.get('/', getHeroSection)
router.get('/bestSellers', getBestSellers)
router.get('/contactInfo', getContactInfoSection)

export default router