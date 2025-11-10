import Express from 'express';
import { findProductsSearch, findProductsQuery, getLatestProducts, getProductById, getProductsByIds, getProductsByQuery } from '../controllers/productController.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/latest', getLatestProducts) // Get latest 10 products - Home page
router.get('/', getProductsByQuery) // Get products - pagination in Products page

// Define route handlers
router.post('/search', findProductsSearch) // Search products - Search Bar and Admin Best Seller
router.get('/query', findProductsQuery) // Search products by query parameters - Search Results Page
router.post('/getProductsByIds', getProductsByIds) // Get List of products by their IDs - used for order details page
router.get('/:id', getProductById) // Get product by id

export default router
