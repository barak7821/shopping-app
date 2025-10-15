import Express from 'express';
import { addMultipleProducts, addProduct, findProducts, findProductsQuery, getProducts } from '../controllers/productController.js';
import cache from '../middlewares/cacheMiddleware.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', cache("10 minutes"), getProducts)

// Define route handlers
router.post('/', addProduct)
router.post('/batch', addMultipleProducts)
router.post('/search', findProducts)
router.get('/query', findProductsQuery)

export default router