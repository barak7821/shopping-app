import Express from 'express';
import { addMultipleProducts, addProduct, getProducts } from '../controllers/productController.js';

const router = Express.Router()

router.post('/', addProduct)
router.get('/', getProducts)
router.post('/batch', addMultipleProducts)

export default router