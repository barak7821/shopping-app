import Express from 'express';
import { addMultipleProducts, addProduct, findProducts, findProductsQuery, getProducts, deleteAllProducts } from '../controllers/productController.js';

const router = Express.Router()

// Caching for frequently used routes
router.get('/', getProducts)

// Define route handlers
router.post('/', addProduct)
router.post('/batch', addMultipleProducts)
router.post('/search', findProducts)
router.get('/query', findProductsQuery)
router.delete('/delete-all', deleteAllProducts)

export default router