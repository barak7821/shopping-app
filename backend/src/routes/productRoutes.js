import Express from 'express';
import { addMultipleProducts, addProduct, findProducts, findProductsQuery, getProducts } from '../controllers/productController.js';

const router = Express.Router()

router.post('/', addProduct)
router.get('/', getProducts)
router.post('/batch', addMultipleProducts)
router.post('/search', findProducts)
router.get('/query', findProductsQuery)

export default router