import Express from 'express';
import { addMultipleProducts, addProduct, findProducts, findProductsQuery, getProducts } from '../controllers/productController.js';

const router = Express.Router()
const cache = apicache.middleware

// Caching for frequently used routes

router.get('/', cache("10 minutes"), getProducts)

// Routes without caching
router.post('/', addProduct)
router.post('/batch', addMultipleProducts)
router.post('/search', findProducts)
router.get('/query', findProductsQuery)

export default router