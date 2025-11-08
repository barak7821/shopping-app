import Express from 'express';
import { findProducts, findProductsQuery, getLatestProducts, getProducts } from '../controllers/productController.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', getProducts)
router.get('/latest', getLatestProducts)

// Define route handlers
router.post('/search', findProducts)
router.get('/query', findProductsQuery)

export default router